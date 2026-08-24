import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { pathMatchesAnyRoot } from "./contract.mjs";

export function analyzeCssSource({ contract, css, scope, sourcePath }) {
  const root = postcss.parse(css, { from: sourcePath });
  const diagnostics = [];
  const customProperties = { definitions: [], references: [] };

  if (scope === "global") {
    diagnostics.push(...analyzeCascadeLayerRoot({ contract, root }).diagnostics);
  }

  root.walkAtRules("import", (atRule) => {
    if (scope !== "global") return;
    const specifier = importSpecifier(atRule.params);
    if (isAllowedGlobalImport(sourcePath, specifier, contract)) return;
    diagnostics.push(
      cssDiagnostic(
        contract.rules.cssApplication.id,
        `CSS-import «${specifier}» er ikke registrert for ${sourcePath}`,
        atRule
      )
    );
  });

  root.walkAtRules("apply", (atRule) => {
    diagnostics.push(
      cssDiagnostic(
        contract.rules.cssApplication.id,
        "@apply er forbudt; skriv utilities direkte i eierkomponenten",
        atRule
      )
    );
  });

  root.walkRules((rule) => {
    if (hasKeyframesAncestor(rule)) return;

    if (scope === "global") validateGlobalSelectors({ contract, diagnostics, rule, sourcePath });
    if (scope === "visualization") {
      validateVisualizationSelectors({ contract, diagnostics, rule, sourcePath });
    }
  });

  root.walkDecls((declaration) => {
    const valueCustomProperties = [...declaration.value.matchAll(/var\((--[A-Za-z0-9_-]+)/g)].map(
      (match) => match[1]
    );

    if (
      declaration.important &&
      !isAllowedImportantDeclaration({ contract, declaration, sourcePath })
    ) {
      diagnostics.push(
        cssDiagnostic(
          contract.rules.cssApplication.id,
          `app-eid !important er forbudt på «${declaration.prop}»`,
          declaration
        )
      );
    }

    if (declaration.prop.startsWith("--")) {
      customProperties.definitions.push(customPropertyFact(declaration.prop, declaration));
    } else if (
      scope === "visualization" &&
      !contract.visualizationException.owners[sourcePath].scopedCssGeometryProperties.includes(
        declaration.prop
      )
    ) {
      diagnostics.push(
        cssDiagnostic(
          contract.rules.visualizationException.id,
          `visualiseringsunntaket tillater ikke CSS-egenskapen «${declaration.prop}»`,
          declaration
        )
      );
    } else if (
      scope === "visualization" &&
      !valueCustomProperties.some((name) =>
        contract.visualizationException.owners[sourcePath].customProperties.includes(name)
      )
    ) {
      diagnostics.push(
        cssDiagnostic(
          contract.rules.visualizationException.id,
          `den skoperte CSS-egenskapen «${declaration.prop}» må konsumere en registrert geometry-custom-property for ${sourcePath}`,
          declaration
        )
      );
    }

    for (const name of valueCustomProperties) {
      customProperties.references.push(customPropertyFact(name, declaration));
    }
  });

  return { customProperties, diagnostics };
}

export function analyzeCssCascadeLayers({ contract, css, sourcePath }) {
  const root = postcss.parse(css, { from: sourcePath });
  return analyzeCascadeLayerRoot({ contract, root });
}

export function validateCustomPropertyFacts({
  contract,
  customProperties,
  isVisualization,
  sourcePath,
}) {
  const diagnostics = [];
  const definitionsByName = groupFacts(customProperties.definitions);
  const referencesByName = groupFacts(customProperties.references);
  const names = new Set([...definitionsByName.keys(), ...referencesByName.keys()]);

  for (const name of [...names].sort()) {
    const definitions = definitionsByName.get(name) ?? [];
    const references = referencesByName.get(name) ?? [];
    const namespace = customPropertyNamespace(name, contract);
    const firstFact = definitions[0] ?? references[0] ?? { column: 1, line: 1 };

    if (!namespace) {
      const ruleId = isVisualization
        ? contract.rules.visualizationException.id
        : contract.rules.customProperty.id;
      const message = isVisualization
        ? `${name} er ikke registrert i det lukkede visualiseringsunntaket`
        : definitions.length > 0
          ? `${name} defineres uten registrert eier`
          : `${name} brukes uten registrert definisjon eller eier`;
      diagnostics.push({ ...firstFact, message, ruleId });
      continue;
    }

    if (
      isVisualization &&
      !contract.visualizationException.owners[sourcePath].customProperties.includes(name)
    ) {
      diagnostics.push({
        ...firstFact,
        message: `${name} er ikke registrert for visualiseringseieren ${sourcePath}`,
        ruleId: contract.rules.visualizationException.id,
      });
      continue;
    }

    if (definitions.length > 0 && !pathMatchesAnyRoot(sourcePath, namespace.definitionRoots)) {
      diagnostics.push({
        ...definitions[0],
        message: `${name} defineres utenfor registrert ${namespace.name}-eier`,
        ruleId: contract.rules.customProperty.id,
      });
    }

    if (references.length > 0 && !pathMatchesAnyRoot(sourcePath, namespace.usageRoots)) {
      diagnostics.push({
        ...references[0],
        message: `${name} brukes utenfor registrert ${namespace.name}-eier`,
        ruleId: contract.rules.customProperty.id,
      });
    }

    if (namespace.requiresLocalDefinition && definitions.length === 0) {
      diagnostics.push({
        ...references[0],
        message: `${name} brukes uten en lokal geometriverdi`,
        ruleId: contract.rules.customProperty.id,
      });
    }

    if (namespace.requiresLocalReference && references.length === 0) {
      diagnostics.push({
        ...definitions[0],
        message: `${name} defineres uten en lokal geometrikonsument`,
        ruleId: contract.rules.customProperty.id,
      });
    } else if (namespace.requiresReference && references.length === 0) {
      diagnostics.push({
        ...definitions[0],
        customPropertyName: name,
        diagnosticKind: "missing-project-reference",
        message: `${name} defineres uten en registrert konsument`,
        ruleId: contract.rules.customProperty.id,
      });
    }
  }

  return diagnostics;
}

export function inlineCustomPropertyFacts(styleSource, location) {
  if (styleSource === null) {
    return { definitions: [], isCustomPropertyDeclarationList: false, references: [] };
  }

  let root;
  try {
    root = postcss.parse(`inline-style { ${styleSource} }`);
  } catch {
    return { definitions: [], isCustomPropertyDeclarationList: false, references: [] };
  }

  const rule = root.nodes.length === 1 && root.first?.type === "rule" ? root.first : null;
  const declarations = rule?.nodes.filter((node) => node.type === "decl") ?? [];
  const isCustomPropertyDeclarationList =
    rule !== null &&
    declarations.length > 0 &&
    declarations.length === rule.nodes.length &&
    declarations.every(
      (declaration) => declaration.prop.startsWith("--") && !declaration.important
    );
  const definitions = declarations
    .filter(({ prop }) => prop.startsWith("--"))
    .map(({ prop }) => ({ ...location, name: prop }));
  const references = declarations.flatMap((declaration) =>
    [...declaration.value.matchAll(/var\((--[A-Za-z0-9_-]+)/g)].map((match) => ({
      ...location,
      name: match[1],
    }))
  );
  return { definitions, isCustomPropertyDeclarationList, references };
}

function analyzeCascadeLayerRoot({ contract, root }) {
  const diagnostics = [];
  const ruleCounts = Object.fromEntries(contract.css.allowedLayers.map((layer) => [layer, 0]));
  let ruleCount = 0;

  root.walkRules((rule) => {
    if (hasKeyframesAncestor(rule)) return;
    ruleCount += 1;

    const layer = enclosingLayer(rule);
    if (layer !== null && Object.hasOwn(ruleCounts, layer)) {
      ruleCounts[layer] += 1;
    }

    validateCascadeLayer({ contract, diagnostics, layer, rule });
  });

  return { diagnostics, ruleCount, ruleCounts };
}

function validateCascadeLayer({ contract, diagnostics, layer, rule }) {
  const layerRuleId = contract.rules.cascadeLayer.id;

  if (layer === null) {
    diagnostics.push(
      cssDiagnostic(
        layerRuleId,
        `CSS-regelen «${rule.selector}» ligger utenfor et registrert cascade layer`,
        rule
      )
    );
  } else if (!contract.css.allowedLayers.includes(layer)) {
    diagnostics.push(
      cssDiagnostic(
        layerRuleId,
        `cascade layer «${layer}» er ikke registrert for «${rule.selector}»`,
        rule
      )
    );
  }
}

function validateGlobalSelectors({ contract, diagnostics, rule, sourcePath }) {
  const layer = enclosingLayer(rule);

  for (const selector of parseSelectors(rule)) {
    if (isAllowedGlobalSelector({ contract, layer, selector, sourcePath })) continue;
    diagnostics.push(
      cssDiagnostic(
        contract.rules.cssApplication.id,
        `global produktselektor «${selector}» er forbudt`,
        rule
      )
    );
  }
}

function validateVisualizationSelectors({ contract, diagnostics, rule, sourcePath }) {
  const ruleId = contract.rules.visualizationException.id;
  if (rule.selector.includes(":global")) {
    diagnostics.push(
      cssDiagnostic(ruleId, "visualiseringsunntaket tillater ikke :global-selektorer", rule)
    );
    return;
  }

  const owner = contract.visualizationException.owners[sourcePath];
  const allowedAnchors = new Set(owner.visualizationAnchors);
  const allowedSeries = new Set(contract.visualizationException.seriesValues);
  let selectorAst;
  try {
    selectorAst = selectorParser().astSync(rule.selector);
  } catch (error) {
    throw new Error(`Kunne ikke parse visualiseringsselektoren «${rule.selector}».`, {
      cause: error,
    });
  }

  for (const selector of selectorAst.nodes) {
    const anchors = [];
    const series = [];
    selector.walkAttributes((attribute) => {
      if (attribute.attribute === "data-visualization") anchors.push(attribute.value ?? null);
      if (attribute.attribute === "data-series") series.push(attribute.value ?? null);
    });

    if (anchors.length === 0) {
      diagnostics.push(
        cssDiagnostic(
          ruleId,
          `visualiseringsselektoren «${selector.toString()}» mangler et registrert data-visualization-anker`,
          rule
        )
      );
    }
    for (const anchor of anchors) {
      if (anchor !== null && allowedAnchors.has(anchor)) continue;
      diagnostics.push(
        cssDiagnostic(
          ruleId,
          `visualiseringsankeret «${anchor ?? "dynamisk"}» er ikke registrert for ${sourcePath}`,
          rule
        )
      );
    }
    for (const value of series) {
      if (value !== null && allowedSeries.has(value)) continue;
      diagnostics.push(
        cssDiagnostic(
          ruleId,
          `visualiseringsserien «${value ?? "dynamisk"}» er ikke registrert`,
          rule
        )
      );
    }
  }
}

function isAllowedGlobalSelector({ contract, layer, selector, sourcePath }) {
  if (
    layer === "theme" &&
    pathMatchesAnyRoot(sourcePath, contract.ownership.themeDefinitionRoots) &&
    contract.css.allowedThemeSelectors.includes(selector)
  ) {
    return true;
  }

  if (
    (layer === "base" || layer === null) &&
    contract.css.allowedBaseSelectors.includes(selector)
  ) {
    return true;
  }

  return contract.css.allowedThirdPartySelectorPatterns.some((pattern) =>
    new RegExp(pattern).test(selector)
  );
}

function isAllowedImportantDeclaration({ contract, declaration, sourcePath }) {
  const rule = declaration.parent?.type === "rule" ? declaration.parent : null;
  if (!rule) return false;
  const selectors = parseSelectors(rule);
  const mediaRule = nearestAtRule(declaration, "media");
  const mediaQuery = mediaRule?.params.trim().replace(/^\((.*)\)$/, "$1") ?? null;

  return contract.css.allowedImportantDeclarations.some(
    (exception) =>
      exception.stylesheet === sourcePath &&
      exception.atRule === mediaQuery &&
      exception.properties.includes(declaration.prop) &&
      selectors.length === exception.selectors.length &&
      selectors.every((selector) => exception.selectors.includes(selector))
  );
}

function parseSelectors(rule) {
  try {
    return selectorParser()
      .astSync(rule.selector)
      .nodes.map((selector) => selector.toString().trim());
  } catch (error) {
    throw new Error(`Kunne ikke parse CSS-selektoren «${rule.selector}».`, { cause: error });
  }
}

function enclosingLayer(node) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "atrule" && parent.name.toLowerCase() === "layer") {
      return parent.params.trim() || "anonymous";
    }
    parent = parent.parent;
  }
  return null;
}

function nearestAtRule(node, name) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "atrule" && parent.name.toLowerCase() === name) return parent;
    parent = parent.parent;
  }
  return null;
}

function hasKeyframesAncestor(node) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "atrule" && /keyframes$/i.test(parent.name)) return true;
    parent = parent.parent;
  }
  return false;
}

function isAllowedGlobalImport(sourcePath, specifier, contract) {
  const importer = contract.css.globalImports.find(({ importer }) => importer === sourcePath);
  if (!importer) return false;
  return importer.specifierPatterns.some((pattern) => new RegExp(pattern).test(specifier));
}

function importSpecifier(parameters) {
  return parameters.match(/^\s*["']([^"']+)["']/)?.[1] ?? parameters.trim();
}

function customPropertyNamespace(name, contract) {
  return contract.customProperties.namespaces.find(
    (namespace) =>
      namespace.exact.includes(name) || namespace.prefixes.some((prefix) => name.startsWith(prefix))
  );
}

function customPropertyFact(name, node) {
  return {
    column: node.source?.start?.column ?? 1,
    line: node.source?.start?.line ?? 1,
    name,
  };
}

function groupFacts(facts) {
  const groups = new Map();
  for (const fact of facts) {
    const entries = groups.get(fact.name) ?? [];
    entries.push(fact);
    groups.set(fact.name, entries);
  }
  return groups;
}

function cssDiagnostic(ruleId, message, node) {
  return {
    column: node.source?.start?.column ?? 1,
    line: node.source?.start?.line ?? 1,
    message,
    ruleId,
  };
}
