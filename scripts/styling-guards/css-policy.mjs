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
    if (scope === "visualization" && rule.selector.includes(":global")) {
      diagnostics.push(
        cssDiagnostic(
          contract.rules.visualizationException.id,
          "visualiseringsunntaket tillater ikke :global-selektorer",
          rule
        )
      );
    }
  });

  root.walkDecls((declaration) => {
    if (declaration.important) {
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
      !contract.visualizationException.scopedCssGeometryProperties.includes(declaration.prop)
    ) {
      diagnostics.push(
        cssDiagnostic(
          contract.rules.visualizationException.id,
          `visualiseringsunntaket tillater ikke CSS-egenskapen «${declaration.prop}»`,
          declaration
        )
      );
    }

    for (const match of declaration.value.matchAll(/var\((--[A-Za-z0-9_-]+)/g)) {
      customProperties.references.push(customPropertyFact(match[1], declaration));
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
        message: `${name} defineres uten en registrert konsument`,
        ruleId: contract.rules.customProperty.id,
      });
    }
  }

  return diagnostics;
}

export function inlineCustomPropertyFacts(attributeSource, location) {
  const definitions = [...attributeSource.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((match) => ({
    ...location,
    name: match[1],
  }));
  const references = [...attributeSource.matchAll(/var\((--[A-Za-z0-9_-]+)/g)].map((match) => ({
    ...location,
    name: match[1],
  }));
  return { definitions, references };
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
