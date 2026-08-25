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
import {
  collectPublicUiSpreadProof,
  resolvePublicUiSpreadStyling,
} from "./public-ui-spread-policy.mjs";
import { offsetLocation, staticPropertyName, walkAst } from "./svelte-ast.mjs";
import { analyzeImperativeDomStyling } from "./svelte-script-policy.mjs";

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
  const publicUiSpreadProof = isPublicUiOwner
    ? collectPublicUiSpreadProof(ast, importNodes, contract)
    : null;

  if (isFeatureOrRoute || isPublicUiOwner) {
    diagnostics.push(
      ...analyzeImperativeDomStyling({
        ast,
        contract,
        isFeatureOrRoute,
        isVisualization,
        source,
      })
    );
  }

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
    if (node.type === contract.markup.rawHtmlNodeType) {
      diagnostics.push(
        markupChannelDiagnostic({
          contract,
          isFeatureOrRoute,
          isVisualization,
          location: offsetLocation(source, node.start ?? 0),
          message: "rå {@html}-markup kan inneholde styling som ikke kan analyseres statisk",
        })
      );
      return;
    }

    if (contract.markup.dynamicNodeTypes.includes(node.type)) {
      analyzeDynamicMarkupNode({
        ast,
        contract,
        diagnostics,
        isFeatureOrRoute,
        isVisualization,
        node,
        source,
        sourcePath,
      });
    }

    if (isRawStylesheetElement(node) || isStylesheetLink(node)) {
      diagnostics.push(
        markupChannelDiagnostic({
          contract,
          isFeatureOrRoute,
          isVisualization,
          location: offsetLocation(source, node.start ?? 0),
          message: "rå style-/stylesheet-markup er forbudt; bruk den registrerte CSS-inngangen",
        })
      );
    }

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
        analyzePublicUiAttribute({
          attribute,
          contract,
          diagnostics,
          node,
          source,
          spreadProof: publicUiSpreadProof,
        });
        continue;
      }

      analyzeNonUiAttribute({ attribute, contract, diagnostics, source });
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
  const channel = markupAttributeChannel(attribute, contract);
  const attributeName = normalizedAttributeName(attribute);

  if (channel === "spread") {
    diagnostics.push(
      diagnostic(
        isVisualization
          ? contract.rules.visualizationException.id
          : contract.rules.featureStyling.id,
        isVisualization
          ? "visualiseringsunntaket tillater ikke attributtspread; skriv registrert geometri eksplisitt"
          : "feature-/routekode kan ikke bruke attributtspread; skriv semantiske props eksplisitt",
        location
      )
    );
    return;
  }

  if (channel === "opaqueStyling") {
    diagnostics.push(
      diagnostic(
        isVisualization
          ? contract.rules.visualizationException.id
          : contract.rules.featureStyling.id,
        isVisualization
          ? `visualiseringsunntaket tillater ikke den ugjennomsiktige stylingkanalen ${attribute.type}`
          : `feature-/routekode kan ikke bruke den ugjennomsiktige stylingkanalen ${attribute.type}`,
        location
      )
    );
    return;
  }

  if (channel === "semantic") return;
  if (!channel) {
    diagnostics.push(
      diagnostic(
        isVisualization
          ? contract.rules.visualizationException.id
          : contract.rules.featureStyling.id,
        `Svelte-attributtkanalen ${attribute.type} er ikke klassifisert i stylingkontrakten`,
        location
      )
    );
    return;
  }

  if (attribute.type === "Attribute" && attributeName === "class") {
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

  if (attribute.type === "Attribute" && attributeName === "style") {
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

  if (attribute.type === "Attribute" && attributeName === "data-stat-role") {
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

  if (attribute.type === "Attribute" && attributeName === "data-visualization") {
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

  if (attribute.type === "Attribute" && attributeName === "data-series") {
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

  const geometryAttribute = canonicalAttributeName(
    attribute.name,
    contract.visualizationException.svgGeometryAttributeVocabulary
  );
  if (geometryAttribute) {
    const isAllowedGeometry =
      isVisualization &&
      contract.visualizationException.owners[sourcePath].svgGeometryAttributes.includes(
        geometryAttribute
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

  if (
    canonicalAttributeName(
      attribute.name,
      contract.visualizationException.svgPresentationAttributes
    )
  ) {
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

function analyzePublicUiAttribute({ attribute, contract, diagnostics, node, source, spreadProof }) {
  const location = offsetLocation(source, attribute.start ?? 0);
  const channel = markupAttributeChannel(attribute, contract);
  const attributeName = normalizedAttributeName(attribute);

  if (channel === "spread") {
    const proof = resolvePublicUiSpreadStyling(attribute.expression, spreadProof);
    if (proof.stylingNames.length > 0) {
      diagnostics.push(
        diagnostic(
          contract.rules.cssApplication.id,
          `offentlig UI kan ikke skjule ${proof.stylingNames.join("/")} i attributtspread`,
          location
        )
      );
    } else if (node.type === "RegularElement" && !proof.resolved) {
      diagnostics.push(
        diagnostic(
          contract.rules.cssApplication.id,
          "offentlig UI må bevise at attributtspread på native element utelater class og style",
          location
        )
      );
    }
    return;
  }

  if (channel === "opaqueStyling") {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        `offentlig UI kan ikke bruke den ugjennomsiktige stylingkanalen ${attribute.type}`,
        location
      )
    );
    return;
  }

  if (channel === "semantic") return;
  if (!channel) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        `Svelte-attributtkanalen ${attribute.type} er ikke klassifisert i stylingkontrakten`,
        location
      )
    );
    return;
  }

  if (attribute.type === "Attribute" && attributeName === "class") {
    diagnostics.push(...analyzeClassAttribute({ attribute, contract, source }));
    return;
  }
  if (attribute.type === "ClassDirective") {
    diagnostics.push(...analyzeClassDirective({ attribute, contract, source }));
    return;
  }
  if (
    (attribute.type === "Attribute" && attributeName === "style") ||
    attribute.type === "StyleDirective"
  ) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "offentlig UI kan ikke bruke inline style; uttrykk varianten med theme og utilities",
        location
      )
    );
  }
}

function analyzeNonUiAttribute({ attribute, contract, diagnostics, source }) {
  const location = offsetLocation(source, attribute.start ?? 0);
  const channel = markupAttributeChannel(attribute, contract);

  if (channel === "semantic") return;
  if (channel === "spread") {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "attributtspread utenfor offentlig UI kan skjule uregistrert produktstyling",
        location
      )
    );
    return;
  }
  if (channel === "opaqueStyling") {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        `den ugjennomsiktige stylingkanalen ${attribute.type} er bare tillatt gjennom en eksplisitt kontrakt`,
        location
      )
    );
    return;
  }
  if (!channel) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        `Svelte-attributtkanalen ${attribute.type} er ikke klassifisert i stylingkontrakten`,
        location
      )
    );
    return;
  }

  const isStylingAttribute =
    (attribute.type === "Attribute" &&
      ["class", "style"].includes(normalizedAttributeName(attribute))) ||
    attribute.type === "ClassDirective" ||
    attribute.type === "StyleDirective";
  if (isStylingAttribute) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "produktstyling utenfor offentlig UI er forbudt",
        location
      )
    );
  }
}

function analyzeDynamicMarkupNode({
  ast,
  contract,
  diagnostics,
  isFeatureOrRoute,
  isVisualization,
  node,
  source,
  sourcePath,
}) {
  if (
    node.type === "SvelteElement" &&
    matchesDynamicElementException({ ast, contract, node, sourcePath })
  ) {
    return;
  }

  diagnostics.push(
    markupChannelDiagnostic({
      contract,
      isFeatureOrRoute,
      isVisualization,
      location: offsetLocation(source, node.start ?? 0),
      message: `${node.type} er en dynamisk markupkanal som ikke kan bevise stylingeierskap`,
    })
  );
}

function matchesDynamicElementException({ ast, contract, node, sourcePath }) {
  const exception = contract.markup.dynamicElementException;
  if (
    sourcePath !== exception.sourcePath ||
    node.tag?.type !== "Identifier" ||
    node.tag.name !== exception.tagIdentifier ||
    node.attributes.length !== 1 ||
    node.attributes[0].type !== "SpreadAttribute" ||
    node.attributes[0].expression?.type !== "Identifier" ||
    node.attributes[0].expression.name !== exception.spreadIdentifier
  ) {
    return false;
  }

  const dynamicElements = [];
  const matchingDestructures = [];
  walkAst(ast, (candidate) => {
    if (candidate.type === "SvelteElement") dynamicElements.push(candidate);
    if (isSanitizedDynamicElementDestructure(candidate, exception)) {
      matchingDestructures.push(candidate);
    }
  });
  return (
    dynamicElements.length === 1 &&
    matchingDestructures.length === 1 &&
    hasAdjacentSanitizedBinding(ast, node, exception)
  );
}

function hasAdjacentSanitizedBinding(ast, dynamicElement, exception) {
  let isAdjacent = false;
  walkAst(ast, (candidate) => {
    for (const child of Object.values(candidate)) {
      if (!Array.isArray(child)) continue;
      const elementIndex = child.indexOf(dynamicElement);
      if (elementIndex < 0) continue;
      const precedingNode = child
        .slice(0, elementIndex)
        .filter((node) => node?.type !== "Text" || node.data.trim() !== "")
        .at(-1);
      if (
        precedingNode?.type === "ConstTag" &&
        precedingNode.declaration?.kind === "const" &&
        precedingNode.declaration.declarations?.length === 1 &&
        isSanitizedDynamicElementDestructure(precedingNode.declaration.declarations[0], exception)
      ) {
        isAdjacent = true;
      }
    }
  });
  return isAdjacent;
}

function isSanitizedDynamicElementDestructure(node, exception) {
  if (
    node.type !== "VariableDeclarator" ||
    node.id?.type !== "ObjectPattern" ||
    node.init?.type !== "Identifier" ||
    node.init.name !== exception.sourceIdentifier
  ) {
    return false;
  }

  const propertyNames = [];
  const restIdentifiers = [];
  for (const property of node.id.properties) {
    if (property.type === "RestElement" && property.argument?.type === "Identifier") {
      restIdentifiers.push(property.argument.name);
      continue;
    }
    if (property.type !== "Property" || property.computed) return false;
    const name = staticPropertyName(property.key);
    if (!name) return false;
    propertyNames.push(name);
  }

  return (
    propertyNames.sort().join(",") === [...exception.omittedAttributeNames].sort().join(",") &&
    restIdentifiers.join(",") === exception.spreadIdentifier
  );
}

function markupAttributeChannel(attribute, contract) {
  for (const [channel, nodeTypes] of Object.entries(contract.markup.attributeNodeTypes)) {
    if (nodeTypes.includes(attribute.type)) return channel;
  }
  return null;
}

function markupChannelDiagnostic({
  contract,
  isFeatureOrRoute,
  isVisualization,
  location,
  message,
}) {
  const ruleId = isVisualization
    ? contract.rules.visualizationException.id
    : isFeatureOrRoute
      ? contract.rules.featureStyling.id
      : contract.rules.cssApplication.id;
  return diagnostic(ruleId, message, location);
}

function isRawStylesheetElement(node) {
  return node.type === "RegularElement" && node.name.toLowerCase() === "style";
}

function isStylesheetLink(node) {
  if (node.type !== "RegularElement" || node.name.toLowerCase() !== "link") return false;
  const rel = node.attributes.find(
    (attribute) => attribute.type === "Attribute" && normalizedAttributeName(attribute) === "rel"
  );
  const hasSpread = node.attributes.some((attribute) => attribute.type === "SpreadAttribute");
  if (hasSpread) return true;
  if (!rel) return false;
  const staticRel = staticAttributeValue(rel);
  if (staticRel === null) return true;
  return staticRel.toLowerCase().split(/\s+/).includes("stylesheet");
}

function normalizedAttributeName(attribute) {
  return attribute.type === "Attribute" && typeof attribute.name === "string"
    ? attribute.name.toLowerCase()
    : null;
}

function canonicalAttributeName(attributeName, vocabulary) {
  if (typeof attributeName !== "string") return null;
  const normalizedName = attributeName.toLowerCase();
  return vocabulary.find((candidate) => candidate.toLowerCase() === normalizedName) ?? null;
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
    (attribute.type === "Attribute" &&
      ["class", "style"].includes(normalizedAttributeName(attribute))) ||
    attribute.type === "ClassDirective" ||
    attribute.type === "StyleDirective" ||
    attribute.type === "SpreadAttribute"
  );
}

function overrideName(attribute) {
  if (attribute.type === "ClassDirective") return "class:";
  if (attribute.type === "StyleDirective") return "style:";
  if (attribute.type === "SpreadAttribute") return "attributtspread";
  return normalizedAttributeName(attribute) ?? attribute.name;
}

function isRegisteredRootStylesheetImport(importer, specifier, contract) {
  return contract.ownership.rootStylesheetImports.some(
    (entry) => entry.importer === importer && entry.specifier === specifier
  );
}

function visitMarkup(root, insideSvg, visitor) {
  const seen = new Set();

  function visit(node, parentInsideSvg) {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    if (node.type === "StyleSheet") return;

    const isMarkupChannel = Array.isArray(node.attributes) || node.type === "HtmlTag";
    const childInsideSvg =
      parentInsideSvg || (node.type === "RegularElement" && node.name.toLowerCase() === "svg");
    if (isMarkupChannel) visitor(node, childInsideSvg);

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

function compareDiagnostics(left, right) {
  return (
    left.line - right.line ||
    left.column - right.column ||
    left.ruleId.localeCompare(right.ruleId) ||
    left.message.localeCompare(right.message)
  );
}
