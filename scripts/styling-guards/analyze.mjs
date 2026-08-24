import { parse } from "svelte/compiler";
import { pathMatchesAnyRoot } from "./contract.mjs";
import {
  analyzeCssSource,
  inlineCustomPropertyFacts,
  validateCustomPropertyFacts,
} from "./css-policy.mjs";
import {
  analyzeClassAttribute,
  analyzeClassDirective,
  staticAttributeValue,
} from "./utility-policy.mjs";

export function analyzeStylingSource({ contract, source, sourcePath }) {
  return analyzeStylingSourceDetails({ contract, source, sourcePath }).diagnostics;
}

export function analyzeStylingSourceDetails({ contract, source, sourcePath }) {
  const result = sourcePath.endsWith(".css")
    ? analyzeGlobalStylesheet({ contract, source, sourcePath })
    : analyzeSvelteComponent({ contract, source, sourcePath });

  return {
    customProperties: result.customProperties,
    diagnostics: result.diagnostics
      .map((entry) => ({ file: sourcePath, ...entry }))
      .sort(compareDiagnostics),
  };
}

function analyzeGlobalStylesheet({ contract, source, sourcePath }) {
  const analysis = analyzeCssSource({
    contract,
    css: source,
    scope: "global",
    sourcePath,
  });
  return {
    customProperties: analysis.customProperties,
    diagnostics: [
      ...analysis.diagnostics,
      ...validateCustomPropertyFacts({
        contract,
        customProperties: analysis.customProperties,
        isVisualization: false,
        sourcePath,
      }),
    ],
  };
}

function analyzeSvelteComponent({ contract, source, sourcePath }) {
  const ast = parse(source, { filename: sourcePath, modern: true });
  const diagnostics = [];
  const customProperties = { definitions: [], references: [] };
  const importNodes = [];
  const styleNodes = [];

  walkAst(ast, (node) => {
    if (node.type === "ImportDeclaration") importNodes.push(node);
    if (node.type === "StyleSheet") styleNodes.push(node);
  });

  const publicUiComponents = collectPublicUiComponents(importNodes, contract);
  const isFeatureOrRoute = pathMatchesAnyRoot(sourcePath, contract.ownership.featureAndRouteRoots);
  const isPublicUiOwner = pathMatchesAnyRoot(sourcePath, contract.ownership.publicUiOwnerRoots);
  const isVisualization = Object.hasOwn(contract.visualizationException.owners, sourcePath);

  for (const importNode of importNodes) {
    analyzeImport({ contract, diagnostics, importNode, isFeatureOrRoute, source, sourcePath });
  }

  for (const styleNode of styleNodes) {
    const location = offsetLocation(source, styleNode.start ?? 0);
    if (isVisualization) {
      if (
        contract.visualizationException.owners[sourcePath].scopedCssGeometryProperties.length === 0
      ) {
        diagnostics.push(
          diagnostic(
            contract.rules.visualizationException.id,
            `${sourcePath} er ikke registrert som eier av skopert visualiserings-CSS`,
            location
          )
        );
      }
      const styleAnalysis = analyzeCssSource({
        contract,
        css: styleNode.content?.styles ?? "",
        scope: "visualization",
        sourcePath,
      });
      diagnostics.push(...styleAnalysis.diagnostics);
      mergeCustomProperties(customProperties, styleAnalysis.customProperties);
    } else if (isFeatureOrRoute) {
      diagnostics.push(
        diagnostic(
          contract.rules.featureStyling.id,
          "feature-/routekode kan ikke eie <style>-blokk",
          location
        )
      );
    } else {
      diagnostics.push(
        diagnostic(
          contract.rules.cssApplication.id,
          "offentlig UI skal bruke utilities direkte og kan ikke eie <style>-blokk",
          location
        )
      );
      const styleAnalysis = analyzeCssSource({
        contract,
        css: styleNode.content?.styles ?? "",
        scope: "ui-scoped",
        sourcePath,
      });
      diagnostics.push(...styleAnalysis.diagnostics);
      mergeCustomProperties(customProperties, styleAnalysis.customProperties);
    }
  }

  visitMarkup(ast, false, (node, insideSvg) => {
    if (!Array.isArray(node.attributes)) return;
    const publicUiComponent =
      node.type === "Component" && isPublicUiComponent(node.name, publicUiComponents);

    for (const attribute of node.attributes) {
      if (publicUiComponent && isFeatureOrRoute && isOverrideAttribute(attribute)) {
        diagnostics.push(
          diagnostic(
            contract.rules.publicUiOverride.id,
            `offentlig UI-komponent ${node.name} kan ikke overstyres med ${overrideName(attribute)}`,
            offsetLocation(source, attribute.start ?? node.start ?? 0)
          )
        );
        continue;
      }

      if (isFeatureOrRoute) {
        analyzeFeatureAttribute({
          attribute,
          contract,
          customProperties,
          diagnostics,
          insideSvg,
          isVisualization,
          source,
          sourcePath,
        });
        continue;
      }

      if (isPublicUiOwner) {
        if (attribute.type === "Attribute" && attribute.name === "class") {
          diagnostics.push(...analyzeClassAttribute({ attribute, contract, source }));
        }
        if (attribute.type === "ClassDirective") {
          diagnostics.push(...analyzeClassDirective({ attribute, contract, source }));
        }
        if (
          (attribute.type === "Attribute" && attribute.name === "style") ||
          attribute.type === "StyleDirective"
        ) {
          diagnostics.push(
            diagnostic(
              contract.rules.cssApplication.id,
              "offentlig UI kan ikke bruke inline style; uttrykk varianten med theme og utilities",
              offsetLocation(source, attribute.start ?? 0)
            )
          );
        }
      }
    }
  });

  diagnostics.push(
    ...validateCustomPropertyFacts({
      contract,
      customProperties,
      isVisualization,
      sourcePath,
    })
  );

  return { customProperties, diagnostics };
}

function analyzeImport({
  contract,
  diagnostics,
  importNode,
  isFeatureOrRoute,
  source,
  sourcePath,
}) {
  const specifier = importNode.source.value;
  const location = offsetLocation(source, importNode.start ?? 0);

  if (
    (specifier === "bits-ui" || specifier.startsWith("bits-ui/")) &&
    !pathMatchesAnyRoot(sourcePath, contract.ownership.bitsUiOwnerRoots)
  ) {
    diagnostics.push(
      diagnostic(
        contract.rules.bitsUiOwner.id,
        `bits-ui kan bare importeres fra src/lib/ui/primitives; fant import i ${sourcePath}`,
        location
      )
    );
  }

  if (!/\.css(?:\?|$)/.test(specifier)) return;
  if (isRegisteredRootStylesheetImport(sourcePath, specifier, contract)) return;

  diagnostics.push(
    diagnostic(
      isFeatureOrRoute ? contract.rules.featureStyling.id : contract.rules.cssApplication.id,
      `CSS-import «${specifier}» er bare tillatt fra den registrerte root-inngangen`,
      location
    )
  );
}

function analyzeFeatureAttribute({
  attribute,
  contract,
  customProperties,
  diagnostics,
  insideSvg,
  isVisualization,
  source,
  sourcePath,
}) {
  const location = offsetLocation(source, attribute.start ?? 0);

  if (attribute.type === "Attribute" && attribute.name === "class") {
    diagnostics.push(
      diagnostic(
        isVisualization
          ? contract.rules.visualizationException.id
          : contract.rules.featureStyling.id,
        isVisualization
          ? "visualiseringsunntaket tillater ikke featureklasser; bruk navngitt geometri"
          : "feature-/routekode kan ikke bruke class på native elementer",
        location
      )
    );
    return;
  }

  if (attribute.type === "ClassDirective") {
    diagnostics.push(
      diagnostic(
        isVisualization
          ? contract.rules.visualizationException.id
          : contract.rules.featureStyling.id,
        isVisualization
          ? "visualiseringsunntaket tillater ikke class:-direktiver"
          : "feature-/routekode kan ikke bruke class:-direktiv",
        location
      )
    );
    return;
  }

  if (attribute.type === "Attribute" && attribute.name === "style") {
    if (!isVisualization) {
      diagnostics.push(
        diagnostic(
          contract.rules.featureStyling.id,
          "feature-/routekode kan ikke bruke style-attributt",
          location
        )
      );
      return;
    }

    const styleSource = reconstructInlineStyle(attribute);
    const facts = inlineCustomPropertyFacts(styleSource, location);
    if (!facts.isCustomPropertyDeclarationList) {
      diagnostics.push(
        diagnostic(
          contract.rules.visualizationException.id,
          "visualiseringsunntaket tillater bare en deklarasjonsliste med navngitte geometry-custom-properties i style",
          location
        )
      );
    }
    mergeCustomProperties(customProperties, facts);
    return;
  }

  if (attribute.type === "StyleDirective") {
    if (!isVisualization) {
      diagnostics.push(
        diagnostic(
          contract.rules.featureStyling.id,
          "feature-/routekode kan ikke bruke style:-direktiv",
          location
        )
      );
      return;
    }

    if (!attribute.name.startsWith("--")) {
      diagnostics.push(
        diagnostic(
          contract.rules.visualizationException.id,
          "visualiseringsunntaket tillater bare navngitte geometry-custom-properties i style:",
          location
        )
      );
      return;
    }
    customProperties.definitions.push({ ...location, name: attribute.name });
    return;
  }

  if (attribute.type === "Attribute" && attribute.name === "data-stat-role") {
    diagnostics.push(
      diagnostic(
        isVisualization
          ? contract.rules.visualizationException.id
          : contract.rules.featureStyling.id,
        "statistikkroller er ikke tillatt; produktidentitet skal eies av offentlig UI",
        location
      )
    );
    return;
  }

  if (attribute.type === "Attribute" && attribute.name === "data-visualization") {
    if (!isVisualization) {
      diagnostics.push(
        diagnostic(
          contract.rules.featureStyling.id,
          `data-visualization kan bare brukes av en eksakt registrert visualiseringseier; fant ${sourcePath}`,
          location
        )
      );
      return;
    }
    const value = staticAttributeValue(attribute);
    const allowedAnchors = contract.visualizationException.owners[sourcePath].visualizationAnchors;
    if (!value || !allowedAnchors.includes(value)) {
      diagnostics.push(
        diagnostic(
          contract.rules.visualizationException.id,
          `visualiseringsankeret «${value ?? "dynamisk"}» er ikke registrert for ${sourcePath}`,
          location
        )
      );
    }
    return;
  }

  if (attribute.type === "Attribute" && attribute.name === "data-series") {
    if (!isVisualization) {
      diagnostics.push(
        diagnostic(
          contract.rules.featureStyling.id,
          `data-series kan bare brukes av en eksakt registrert visualiseringseier; fant ${sourcePath}`,
          location
        )
      );
      return;
    }
    const value = staticAttributeValue(attribute);
    if (!value || !contract.visualizationException.seriesValues.includes(value)) {
      diagnostics.push(
        diagnostic(
          contract.rules.visualizationException.id,
          `visualiseringsserien «${value ?? "dynamisk"}» er ikke registrert`,
          location
        )
      );
    }
    return;
  }

  if (!insideSvg || attribute.type !== "Attribute") return;

  if (contract.visualizationException.svgGeometryAttributeVocabulary.includes(attribute.name)) {
    const isAllowedGeometry =
      isVisualization &&
      contract.visualizationException.owners[sourcePath].svgGeometryAttributes.includes(
        attribute.name
      );
    if (!isAllowedGeometry) {
      diagnostics.push(
        diagnostic(
          isVisualization
            ? contract.rules.visualizationException.id
            : contract.rules.featureStyling.id,
          isVisualization
            ? `SVG-geometriattributtet «${attribute.name}» er ikke registrert for ${sourcePath}`
            : `feature-/routekode kan ikke eie SVG-geometriattributtet «${attribute.name}»`,
          location
        )
      );
    }
    return;
  }

  if (contract.visualizationException.svgPresentationAttributes.includes(attribute.name)) {
    diagnostics.push(
      diagnostic(
        isVisualization
          ? contract.rules.visualizationException.id
          : contract.rules.featureStyling.id,
        isVisualization
          ? `visualiseringsunntaket tillater ikke SVG-presentasjonsattributtet «${attribute.name}»`
          : `feature-/routekode kan ikke eie SVG-presentasjonsattributtet «${attribute.name}»`,
        location
      )
    );
  }
}

function collectPublicUiComponents(importNodes, contract) {
  const exact = new Set();
  const namespaces = new Set();

  for (const importNode of importNodes) {
    if (!isPublicUiImport(importNode.source.value, contract)) continue;
    for (const specifier of importNode.specifiers) {
      if (specifier.type === "ImportNamespaceSpecifier") namespaces.add(specifier.local.name);
      else exact.add(specifier.local.name);
    }
  }

  return { exact, namespaces };
}

function isPublicUiImport(specifier, contract) {
  return contract.ownership.publicUiImportPrefixes.some(
    (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`)
  );
}

function isPublicUiComponent(name, publicUiComponents) {
  if (publicUiComponents.exact.has(name)) return true;
  return [...publicUiComponents.namespaces].some((namespace) => name.startsWith(`${namespace}.`));
}

function isOverrideAttribute(attribute) {
  return (
    (attribute.type === "Attribute" && ["class", "style"].includes(attribute.name)) ||
    attribute.type === "ClassDirective" ||
    attribute.type === "StyleDirective"
  );
}

function overrideName(attribute) {
  if (attribute.type === "ClassDirective") return "class:";
  if (attribute.type === "StyleDirective") return "style:";
  return attribute.name;
}

function isRegisteredRootStylesheetImport(importer, specifier, contract) {
  return contract.ownership.rootStylesheetImports.some(
    (entry) => entry.importer === importer && entry.specifier === specifier
  );
}

function walkAst(root, visitor) {
  const seen = new Set();

  function visit(node) {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    visitor(node);
    for (const [key, child] of Object.entries(node)) {
      if (["loc", "metadata", "parent"].includes(key)) continue;
      if (Array.isArray(child)) child.forEach(visit);
      else visit(child);
    }
  }

  visit(root);
}

function visitMarkup(root, insideSvg, visitor) {
  const seen = new Set();

  function visit(node, parentInsideSvg) {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    if (node.type === "StyleSheet") return;

    const isElement = node.type === "RegularElement" || node.type === "Component";
    const childInsideSvg =
      parentInsideSvg || (node.type === "RegularElement" && node.name.toLowerCase() === "svg");
    if (isElement) visitor(node, childInsideSvg);

    for (const [key, child] of Object.entries(node)) {
      if (["attributes", "loc", "metadata", "parent"].includes(key)) continue;
      if (Array.isArray(child)) child.forEach((item) => visit(item, childInsideSvg));
      else visit(child, childInsideSvg);
    }
  }

  visit(root, insideSvg);
}

function mergeCustomProperties(target, source) {
  target.definitions.push(...source.definitions);
  target.references.push(...source.references);
}

function reconstructInlineStyle(attribute) {
  if (Array.isArray(attribute.value)) {
    const chunks = [];
    for (const part of attribute.value) {
      if (part.type === "Text") chunks.push(part.data);
      else if (part.type === "ExpressionTag") chunks.push("0");
      else return null;
    }
    return chunks.join("");
  }

  const expression = attribute.value?.type === "ExpressionTag" ? attribute.value.expression : null;
  if (expression?.type === "Literal" && typeof expression.value === "string") {
    return expression.value;
  }
  if (expression?.type !== "TemplateLiteral") return null;

  return expression.quasis
    .map(
      ({ value }, index) =>
        `${value.cooked ?? value.raw}${index < expression.expressions.length ? "0" : ""}`
    )
    .join("");
}

function diagnostic(ruleId, message, location) {
  return { ...location, message, ruleId };
}

function offsetLocation(source, offset) {
  const before = source.slice(0, Math.max(offset, 0));
  const lastNewline = before.lastIndexOf("\n");
  return {
    column: before.length - lastNewline,
    line: (before.match(/\n/g)?.length ?? 0) + 1,
  };
}

function compareDiagnostics(left, right) {
  return (
    left.line - right.line ||
    left.column - right.column ||
    left.ruleId.localeCompare(right.ruleId) ||
    left.message.localeCompare(right.message)
  );
}
