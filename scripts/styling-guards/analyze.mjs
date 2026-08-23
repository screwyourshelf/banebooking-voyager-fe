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
  const result = sourcePath.endsWith(".css")
    ? analyzeGlobalStylesheet({ contract, source, sourcePath })
    : analyzeSvelteComponent({ contract, source, sourcePath });

  return result.map((entry) => ({ file: sourcePath, ...entry })).sort(compareDiagnostics);
}

function analyzeGlobalStylesheet({ contract, source, sourcePath }) {
  const analysis = analyzeCssSource({
    contract,
    css: source,
    scope: "global",
    sourcePath,
  });
  return [
    ...analysis.diagnostics,
    ...validateCustomPropertyFacts({
      contract,
      customProperties: analysis.customProperties,
      isVisualization: false,
      sourcePath,
    }),
  ];
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
  const isVisualization = pathMatchesAnyRoot(
    sourcePath,
    contract.visualizationException.ownerRoots
  );

  for (const importNode of importNodes) {
    analyzeImport({ contract, diagnostics, importNode, isFeatureOrRoute, source, sourcePath });
  }

  for (const styleNode of styleNodes) {
    const location = offsetLocation(source, styleNode.start ?? 0);
    if (isVisualization) {
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

  return diagnostics;
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

    const attributeSource = source.slice(attribute.start ?? 0, attribute.end ?? 0);
    const facts = inlineCustomPropertyFacts(attributeSource, location);
    if (facts.definitions.length === 0) {
      diagnostics.push(
        diagnostic(
          contract.rules.visualizationException.id,
          "visualiseringsunntaket tillater bare navngitte geometry-custom-properties i style",
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

  if (attribute.type === "Attribute" && attribute.name === "data-stat-role" && isVisualization) {
    const role = staticAttributeValue(attribute);
    if (!role || !contract.visualizationException.statisticRoles.includes(role)) {
      diagnostics.push(
        diagnostic(
          contract.rules.visualizationException.id,
          `statistikkrollen «${role ?? "dynamisk"}» er ikke registrert`,
          location
        )
      );
    }
    return;
  }

  if (
    insideSvg &&
    isVisualization &&
    attribute.type === "Attribute" &&
    contract.visualizationException.forbiddenSvgPresentationAttributes.includes(attribute.name)
  ) {
    const value = staticAttributeValue(attribute);
    const allowedValues =
      contract.visualizationException.svgPresentationValueAllowlist[attribute.name] ?? [];
    if (!value || !allowedValues.includes(value)) {
      diagnostics.push(
        diagnostic(
          contract.rules.visualizationException.id,
          `visualiseringsunntaket tillater ikke SVG-attributtet «${attribute.name}»`,
          location
        )
      );
    }
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
