import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { parse } from "svelte/compiler";
import { loadStylingGuardContract } from "../styling-guards/contract.mjs";
import { customPropertyReferences as extractCustomPropertyReferences } from "../styling-guards/custom-property-references.mjs";
import { checkStylingProductionTree } from "../styling-guards/production-tree-contract.mjs";
import { emptySelectorFacts, ownerForMarkup, ownerForStylesheet } from "./ownership.mjs";

const legacyStylesheets = new Set();

const tailwindUtilityRoots = new Set([
  "absolute",
  "accent",
  "align",
  "animate",
  "appearance",
  "aspect",
  "auto-cols",
  "auto-rows",
  "backdrop",
  "basis",
  "bg",
  "block",
  "blur",
  "border",
  "bottom",
  "box",
  "break",
  "brightness",
  "caption",
  "caret",
  "clear",
  "col",
  "columns",
  "container",
  "content",
  "contrast",
  "cursor",
  "decoration",
  "delay",
  "divide",
  "drop-shadow",
  "duration",
  "ease",
  "fill",
  "filter",
  "fixed",
  "flex",
  "float",
  "flow-root",
  "font",
  "from",
  "gap",
  "grayscale",
  "grid",
  "grow",
  "h",
  "hidden",
  "hue-rotate",
  "hyphens",
  "inline",
  "inset",
  "invert",
  "isolate",
  "isolation",
  "items",
  "justify",
  "leading",
  "left",
  "line-clamp",
  "list",
  "m",
  "max-h",
  "max-w",
  "min-h",
  "min-w",
  "mix-blend",
  "object",
  "opacity",
  "order",
  "origin",
  "outline",
  "overflow",
  "overscroll",
  "p",
  "place",
  "pointer-events",
  "relative",
  "resize",
  "right",
  "ring",
  "rotate",
  "rounded",
  "row",
  "saturate",
  "scale",
  "select",
  "shadow",
  "shrink",
  "size",
  "skew",
  "space",
  "sr-only",
  "static",
  "sticky",
  "stroke",
  "table",
  "text",
  "top",
  "touch",
  "transform",
  "transition",
  "translate",
  "truncate",
  "underline",
  "via",
  "visible",
  "w",
  "whitespace",
  "will-change",
  "z",
]);

export async function measureStylingSource(projectRoot) {
  const contract = await loadStylingGuardContract();
  const sourceRoot = path.join(projectRoot, "src");
  const sourceFiles = await collectFiles(sourceRoot);
  const cssFiles = sourceFiles.filter((file) => file.endsWith(".css"));
  const markupFiles = sourceFiles.filter(
    (file) =>
      file === path.join(sourceRoot, "app.html") ||
      (file.endsWith(".svelte") && !file.endsWith(".test.svelte"))
  );

  const [css, markup] = await Promise.all([
    measureStylesheets(projectRoot, cssFiles),
    measureMarkup(projectRoot, markupFiles, contract.visualizationException),
    checkStylingProductionTree(projectRoot),
  ]);
  const tailwindUtilities = sortEntries([
    ...css.applyDirectives.flatMap((directive) =>
      directive.utilities.map((utility) => ({
        column: directive.column,
        file: directive.file,
        line: directive.line,
        origin: "@apply",
        utility,
        ...pickOwner(directive),
      }))
    ),
    ...markup.tailwindUtilities,
  ]);
  const visualizationExceptions = sortEntries([
    ...markup.styleAttributes
      .filter(({ disposition }) => disposition === "visualization-exception-candidate")
      .map((entry) => ({ exceptionKind: "inline-custom-property", ...entry })),
    ...markup.styleDirectives
      .filter(({ disposition }) => disposition === "visualization-exception-candidate")
      .map((entry) => ({ exceptionKind: "style-directive", ...entry })),
    ...markup.svgGeometryAttributes.map((entry) => ({
      exceptionKind: "svg-geometry",
      ...entry,
    })),
  ]);
  const legacyDebt = buildLegacyDebt(css, markup);
  const selectorsByOwnerFamily = countBy(css.selectors, "ownerFamily");
  const rulesByLayer = countBy(css.rules, "layer", "unlayered");

  return {
    scope: {
      css: "All versioned src/**/*.css files.",
      legacyStylesheets: [...legacyStylesheets].sort(compareStrings),
      markup:
        "src/app.html and production .svelte files under src; *.test.svelte fixtures are excluded.",
      rawVisualValueDefinition:
        "Non-zero numeric literals, literal colors and literal font families in visual CSS declarations.",
    },
    summary: {
      applyDirectiveCount: css.applyDirectives.length,
      applyUtilityTokenCount: css.applyDirectives.reduce(
        (total, { utilities }) => total + utilities.length,
        0
      ),
      cssCustomPropertyDefinitionCount: css.customProperties.definitions.length,
      cssCustomPropertyReferenceCount: css.customProperties.references.length,
      cssFileCount: css.files.length,
      cssLineCount: sum(css.files, "lineCount"),
      cssRuleCount: css.rules.length,
      featureClassOccurrenceCount: markup.featureClasses.length,
      importantDeclarationCount: css.importantDeclarations.length,
      layeredCssRuleCount: css.rules.filter(({ layer }) => layer !== null).length,
      legacyDebtCount: legacyDebt.length,
      markupFileCount: markup.files.length,
      rawVisualDeclarationCount: css.rawVisualDeclarations.length,
      selectorCount: css.selectors.length,
      styleAttributeCount: markup.styleAttributes.length,
      styleBlockCount: markup.styleBlocks.length,
      styleDirectiveCount: markup.styleDirectives.length,
      svelteTailwindUtilityOccurrenceCount: markup.tailwindUtilities.length,
      tailwindUtilityOccurrenceCount: tailwindUtilities.length,
      unlayeredCssRuleCount: css.rules.filter(({ layer }) => layer === null).length,
      visualizationExceptionCount: visualizationExceptions.length,
    },
    css: {
      files: css.files,
      rulesByLayer,
      selectorsByOwnerFamily,
      selectors: css.selectors,
      unlayeredRules: css.rules.filter(({ layer }) => layer === null),
      importantDeclarations: css.importantDeclarations,
      rawVisualDeclarations: css.rawVisualDeclarations,
      customProperties: css.customProperties,
      applyDirectives: css.applyDirectives,
    },
    markup,
    tailwindUtilities,
    visualizationExceptions,
    legacyDebt,
  };
}

async function measureStylesheets(projectRoot, absoluteFiles) {
  const files = [];
  const rules = [];
  const selectors = [];
  const importantDeclarations = [];
  const rawVisualDeclarations = [];
  const customPropertyDefinitions = [];
  const customPropertyReferences = [];
  const applyDirectives = [];

  for (const absoluteFile of absoluteFiles) {
    const file = repositoryPath(projectRoot, absoluteFile);
    const source = await readFile(absoluteFile, "utf8");
    const root = postcss.parse(source, { from: file });
    let atRuleCount = 0;
    let declarationCount = 0;
    let keyframeStepCount = 0;

    root.walkAtRules(() => {
      atRuleCount += 1;
    });

    root.walkRules((rule) => {
      if (hasKeyframesAncestor(rule)) {
        keyframeStepCount += 1;
        return;
      }

      const selectorParts = parseSelectors(rule.selector, file, rule.source?.start?.line ?? 1);
      const selectorFacts = mergeSelectorFacts(selectorParts.map(({ facts }) => facts));
      const location = postcssLocation(file, rule);
      const layer = enclosingLayer(rule);
      const ruleOwner = ownerForStylesheet({
        file,
        line: location.line,
        selectorFacts,
      });
      rules.push({
        ...location,
        layer,
        selector: rule.selector,
        selectorCount: selectorParts.length,
        ...ruleOwner,
      });

      for (const selectorPart of selectorParts) {
        selectors.push({
          ...location,
          layer,
          selector: selectorPart.selector,
          ...ownerForStylesheet({
            file,
            line: location.line,
            selectorFacts: selectorPart.facts,
          }),
        });
      }
    });

    root.walkDecls((declaration) => {
      declarationCount += 1;
      const location = postcssLocation(file, declaration);
      const owner = ownerForDeclaration(file, declaration, location.line);

      if (declaration.important) {
        importantDeclarations.push({
          ...location,
          property: declaration.prop,
          value: declaration.value,
          ...owner,
        });
      }

      const rawValues = rawVisualValues(declaration.prop, declaration.value);
      if (rawValues.length > 0) {
        rawVisualDeclarations.push({
          ...location,
          property: declaration.prop,
          rawValues,
          value: declaration.value,
          ...owner,
        });
      }

      if (declaration.prop.startsWith("--")) {
        customPropertyDefinitions.push({
          ...location,
          name: declaration.prop,
          value: declaration.value,
          ...owner,
        });
      }

      let referenceIndex = 0;
      for (const name of extractCustomPropertyReferences(declaration.value)) {
        customPropertyReferences.push({
          ...location,
          name,
          property: declaration.prop,
          referenceIndex,
          ...owner,
        });
        referenceIndex += 1;
      }
    });

    root.walkAtRules("apply", (atRule) => {
      const location = postcssLocation(file, atRule);
      const owner = ownerForDeclaration(file, atRule, location.line);
      applyDirectives.push({
        ...location,
        utilities: atRule.params.split(/\s+/).filter(Boolean),
        ...owner,
      });
    });

    const fileRules = rules.filter((entry) => entry.file === file);
    const fileSelectors = selectors.filter((entry) => entry.file === file);
    files.push({
      atRuleCount,
      declarationCount,
      file,
      keyframeStepCount,
      layeredRuleCount: fileRules.filter(({ layer }) => layer !== null).length,
      lineCount: lineCount(source),
      ruleCount: fileRules.length,
      selectorCount: fileSelectors.length,
      unlayeredRuleCount: fileRules.filter(({ layer }) => layer === null).length,
    });
  }

  return {
    applyDirectives: sortEntries(applyDirectives),
    customProperties: {
      definitions: sortEntries(customPropertyDefinitions),
      references: sortEntries(customPropertyReferences),
      summary: summarizeCustomProperties(customPropertyDefinitions, customPropertyReferences),
    },
    files: sortEntries(files),
    importantDeclarations: sortEntries(importantDeclarations),
    rawVisualDeclarations: sortEntries(rawVisualDeclarations),
    rules: sortEntries(rules),
    selectors: sortEntries(selectors),
  };
}

async function measureMarkup(projectRoot, absoluteFiles, visualizationException) {
  const files = [];
  const classTokens = [];
  const dynamicClassAttributes = [];
  const classDirectives = [];
  const featureClasses = [];
  const styleAttributes = [];
  const styleDirectives = [];
  const styleBlocks = [];
  const cssImports = [];
  const tailwindUtilities = [];
  const geometryAttributes = [];
  const statisticRoles = [];

  for (const absoluteFile of absoluteFiles) {
    const file = repositoryPath(projectRoot, absoluteFile);
    const source = await readFile(absoluteFile, "utf8");
    const ast = parse(source, { filename: file, modern: true });
    const owner = ownerForMarkup(file);
    const visualizationOwner = visualizationException.owners[file] ?? null;
    const fileCounts = {
      classTokenCount: 0,
      cssImportCount: 0,
      dynamicClassAttributeCount: 0,
      file,
      lineCount: lineCount(source),
      styleAttributeCount: 0,
      styleBlockCount: 0,
      styleDirectiveCount: 0,
    };

    for (const match of source.matchAll(
      /\bimport\s+(?:[^"']+?\s+from\s+)?["']([^"']+\.css)["']/g
    )) {
      const location = offsetLocation(file, source, match.index ?? 0);
      const isRootStylesheetEntry =
        file === "src/routes/+layout.svelte" && match[1] === "../index.css";
      cssImports.push({
        ...location,
        ...owner,
        disposition: isRootStylesheetEntry ? "root-stylesheet-entry" : "transition-debt",
        importPath: match[1],
        plannedRemovalCheckpoint: isRootStylesheetEntry ? null : owner.plannedRemovalCheckpoint,
      });
      fileCounts.cssImportCount += 1;
    }

    const seen = new Set();
    visit(ast, false);

    function visit(node, insideSvg) {
      if (!node || typeof node !== "object" || seen.has(node)) return;
      seen.add(node);

      if (node.type === "StyleSheet") {
        const location = offsetLocation(file, source, node.start ?? 0);
        const disposition =
          file === "src/app.html"
            ? "startup-document-contract"
            : visualizationOwner
              ? "visualization-exception-candidate"
              : "transition-debt";
        styleBlocks.push({
          ...location,
          contentLineCount: lineCount(node.content?.styles ?? ""),
          disposition,
          ...owner,
        });
        fileCounts.styleBlockCount += 1;
        return;
      }

      const childInsideSvg =
        insideSvg || (node.type === "RegularElement" && node.name.toLowerCase() === "svg");
      if (node.type === "RegularElement" && node.name.toLowerCase() === "style") {
        const location = offsetLocation(file, source, node.start ?? 0);
        styleBlocks.push({
          ...location,
          contentLineCount: lineCount(source.slice(node.start ?? 0, node.end ?? 0)),
          disposition: file === "src/app.html" ? "startup-document-contract" : "transition-debt",
          ...owner,
        });
        fileCounts.styleBlockCount += 1;
      }
      if (Array.isArray(node.attributes)) {
        for (const attribute of node.attributes) {
          measureAttribute(attribute, childInsideSvg);
        }
      }

      for (const [key, child] of Object.entries(node)) {
        if (["attributes", "loc", "metadata", "parent"].includes(key)) continue;
        if (Array.isArray(child)) {
          for (const item of child) visit(item, childInsideSvg);
        } else {
          visit(child, childInsideSvg);
        }
      }
    }

    function measureAttribute(attribute, insideSvg) {
      const location = offsetLocation(file, source, attribute.start ?? 0);
      const attributeSource = source.slice(attribute.start ?? 0, attribute.end ?? 0).trim();

      if (attribute.type === "Attribute" && attribute.name === "class") {
        const staticValue = staticAttributeValue(attribute);
        if (staticValue === null) {
          dynamicClassAttributes.push({
            ...location,
            expression: attributeSource,
            ...owner,
          });
          fileCounts.dynamicClassAttributeCount += 1;
          return;
        }

        for (const className of staticValue.split(/\s+/).filter(Boolean)) {
          const entry = { ...location, className, ...owner };
          classTokens.push(entry);
          fileCounts.classTokenCount += 1;
          if (isTailwindUtility(className)) {
            tailwindUtilities.push({ ...entry, origin: "class", utility: className });
          }
          if (
            owner.ownerPackage.startsWith("src/lib/features/") ||
            owner.ownerPackage === "src/routes"
          ) {
            featureClasses.push({
              ...entry,
              disposition: "transition-debt",
            });
          }
        }
        return;
      }

      if (attribute.type === "ClassDirective") {
        const entry = { ...location, className: attribute.name, ...owner };
        classDirectives.push(entry);
        if (isTailwindUtility(attribute.name)) {
          tailwindUtilities.push({ ...entry, origin: "class-directive", utility: attribute.name });
        }
        return;
      }

      if (attribute.type === "Attribute" && attribute.name === "style") {
        const customProperties = [...attributeSource.matchAll(/--[A-Za-z0-9_-]+/g)].map(
          (match) => match[0]
        );
        const disposition = markupStyleDisposition(file, visualizationOwner, customProperties);
        styleAttributes.push({
          ...location,
          customProperties: [...new Set(customProperties)].sort(compareStrings),
          disposition,
          expression: attributeSource,
          ...owner,
        });
        fileCounts.styleAttributeCount += 1;
        return;
      }

      if (attribute.type === "StyleDirective") {
        const customProperties = attribute.name.startsWith("--") ? [attribute.name] : [];
        const disposition = markupStyleDisposition(file, visualizationOwner, customProperties);
        styleDirectives.push({
          ...location,
          disposition,
          expression: attributeSource,
          property: attribute.name,
          ...owner,
        });
        fileCounts.styleDirectiveCount += 1;
        return;
      }

      if (
        attribute.type === "Attribute" &&
        attribute.name === "data-stat-role" &&
        owner.ownerFamily === "statistics-visualization"
      ) {
        statisticRoles.push({
          ...location,
          role: staticAttributeValue(attribute) ?? attributeSource,
          ...owner,
        });
      }

      if (
        insideSvg &&
        attribute.type === "Attribute" &&
        visualizationOwner?.svgGeometryAttributes.includes(attribute.name)
      ) {
        geometryAttributes.push({
          ...location,
          attribute: attribute.name,
          expression: attributeSource,
          ...owner,
        });
      }
    }

    files.push(fileCounts);
  }

  return {
    classDirectives: sortEntries(classDirectives),
    classTokens: sortEntries(classTokens),
    cssImports: sortEntries(cssImports),
    dynamicClassAttributes: sortEntries(dynamicClassAttributes),
    featureClasses: sortEntries(featureClasses),
    files: sortEntries(files),
    statisticRoles: sortEntries(statisticRoles),
    styleAttributes: sortEntries(styleAttributes),
    styleBlocks: sortEntries(styleBlocks),
    styleDirectives: sortEntries(styleDirectives),
    svgGeometryAttributes: sortEntries(geometryAttributes),
    tailwindUtilities: sortEntries(tailwindUtilities),
  };
}

function buildLegacyDebt(css, markup) {
  const debt = [];

  for (const selector of css.selectors.filter(({ file }) => legacyStylesheets.has(file))) {
    debt.push({ debtKind: "global-product-selector", ...selector });
  }
  for (const rule of css.rules.filter(
    ({ file, layer }) => legacyStylesheets.has(file) && layer === null
  )) {
    debt.push({ debtKind: "unlayered-rule", ...rule });
  }
  for (const declaration of css.importantDeclarations.filter(({ file }) =>
    legacyStylesheets.has(file)
  )) {
    debt.push({ debtKind: "important-declaration", ...declaration });
  }
  for (const declaration of css.rawVisualDeclarations.filter(({ file }) =>
    legacyStylesheets.has(file)
  )) {
    debt.push({ debtKind: "raw-visual-declaration", ...declaration });
  }
  for (const definition of css.customProperties.definitions.filter(({ file }) =>
    legacyStylesheets.has(file)
  )) {
    debt.push({ debtKind: "component-custom-property-definition", ...definition });
  }
  for (const directive of css.applyDirectives.filter(({ file }) => legacyStylesheets.has(file))) {
    debt.push({ debtKind: "apply-directive", ...directive });
  }
  for (const featureClass of markup.featureClasses) {
    debt.push({ debtKind: "feature-class", ...featureClass });
  }
  for (const dynamicClass of markup.dynamicClassAttributes.filter(
    ({ ownerPackage }) =>
      ownerPackage.startsWith("src/lib/features/") || ownerPackage === "src/routes"
  )) {
    debt.push({ debtKind: "feature-dynamic-class", ...dynamicClass });
  }
  for (const styleAttribute of markup.styleAttributes.filter(
    ({ disposition }) => disposition === "transition-debt"
  )) {
    debt.push({ debtKind: "inline-style", ...styleAttribute });
  }
  for (const styleDirective of markup.styleDirectives.filter(
    ({ disposition }) => disposition === "transition-debt"
  )) {
    debt.push({ debtKind: "style-directive", ...styleDirective });
  }
  for (const styleBlock of markup.styleBlocks.filter(
    ({ disposition }) => disposition === "transition-debt"
  )) {
    debt.push({ debtKind: "component-style-block", ...styleBlock });
  }
  for (const cssImport of markup.cssImports.filter(
    ({ disposition }) => disposition === "transition-debt"
  )) {
    debt.push({ debtKind: "feature-or-route-css-import", ...cssImport });
  }

  return sortEntries(debt);
}

function ownerForDeclaration(file, node, line) {
  const rule = nearestRule(node);
  const selectorFacts = rule
    ? mergeSelectorFacts(parseSelectors(rule.selector, file, line).map(({ facts }) => facts))
    : emptySelectorFacts();
  return ownerForStylesheet({
    file,
    keyframeName: nearestKeyframes(node)?.params.trim() ?? null,
    line,
    selectorFacts,
  });
}

function nearestRule(node) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "rule" && !hasKeyframesAncestor(parent)) return parent;
    parent = parent.parent;
  }
  return null;
}

function nearestKeyframes(node) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "atrule" && /keyframes$/i.test(parent.name)) return parent;
    parent = parent.parent;
  }
  return null;
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

function parseSelectors(selector, file, line) {
  try {
    const root = selectorParser().astSync(selector);
    return root.nodes.map((node) => ({
      facts: selectorFacts(node),
      selector: node.toString().trim(),
    }));
  } catch (error) {
    throw new Error(`${file}:${line} kunne ikke parse selektoren «${selector}».`, {
      cause: error,
    });
  }
}

function selectorFacts(node) {
  const facts = emptySelectorFacts();
  node.walkAttributes((attribute) => {
    const value = attribute.value ?? null;
    facts.attributes.push({ name: attribute.attribute, value });
    if (attribute.attribute === "data-ui" && value) facts.uiNames.push(value);
    if (attribute.attribute === "data-ui-primitive" && value) {
      facts.primitiveNames.push(value);
    }
  });
  node.walkClasses((classNode) => facts.classes.push(classNode.value));
  return normalizeSelectorFacts(facts);
}

function mergeSelectorFacts(factsList) {
  return normalizeSelectorFacts({
    attributes: factsList.flatMap(({ attributes }) => attributes),
    classes: factsList.flatMap(({ classes }) => classes),
    primitiveNames: factsList.flatMap(({ primitiveNames }) => primitiveNames),
    uiNames: factsList.flatMap(({ uiNames }) => uiNames),
  });
}

function normalizeSelectorFacts(facts) {
  return {
    attributes: uniqueObjects(facts.attributes),
    classes: [...new Set(facts.classes)].sort(compareStrings),
    primitiveNames: [...new Set(facts.primitiveNames)].sort(compareStrings),
    uiNames: [...new Set(facts.uiNames)].sort(compareStrings),
  };
}

function rawVisualValues(property, value) {
  if (!isVisualProperty(property) && !property.startsWith("--")) return [];

  const values = [];
  for (const match of value.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) values.push(match[0]);
  for (const match of value.matchAll(/\b(?:black|currentColor|transparent|white)\b/gi)) {
    values.push(match[0]);
  }
  for (const match of value.matchAll(
    /(?<![#A-Za-z0-9_-])-?(?:\d+\.\d+|\d+|\.\d+)(?:cqw|cqh|dvh|dvw|svh|svw|lvh|lvw|vmin|vmax|rem|px|em|ex|ch|vw|vh|ms|deg|rad|turn|s|%)?(?![A-Za-z0-9_-])/g
  )) {
    if (/^-?(?:0|0\.0+)$/.test(match[0])) continue;
    values.push(match[0]);
  }
  if (/font(?:-family)?$/i.test(property) && !value.includes("var(")) values.push(value.trim());
  return [...new Set(values)].sort(compareStrings);
}

function isVisualProperty(property) {
  return /(?:animation|background|border|bottom|color|column|filter|flex|font|gap|grid|height|inset|left|letter-spacing|line-height|margin|opacity|outline|padding|perspective|right|shadow|stroke|text|top|transform|transition|width|z-index)/i.test(
    property
  );
}

function markupStyleDisposition(file, visualizationOwner, customProperties) {
  if (file === "src/app.html") return "startup-document-contract";
  if (
    visualizationOwner &&
    customProperties.length > 0 &&
    customProperties.every((name) => visualizationOwner.customProperties.includes(name))
  ) {
    return "visualization-exception-candidate";
  }
  return "transition-debt";
}

function staticAttributeValue(attribute) {
  if (!Array.isArray(attribute.value)) return null;
  if (!attribute.value.every((part) => part.type === "Text")) return null;
  return attribute.value.map((part) => part.data).join("");
}

function isTailwindUtility(className) {
  if (["dark", "light", "ProseMirror", "selectedCell"].includes(className)) return false;
  let candidate = stripVariants(className).replace(/^!/, "").replace(/^-/, "");
  if (!candidate) return false;
  if (candidate.startsWith("[")) return true;
  const root = candidate.split("-")[0];
  if (tailwindUtilityRoots.has(root)) return true;
  return [...tailwindUtilityRoots].some((utilityRoot) => candidate.startsWith(`${utilityRoot}-`));
}

function stripVariants(className) {
  let bracketDepth = 0;
  let lastSeparator = -1;
  for (let index = 0; index < className.length; index += 1) {
    const character = className[index];
    if (character === "[") bracketDepth += 1;
    if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    if (character === ":" && bracketDepth === 0) lastSeparator = index;
  }
  return className.slice(lastSeparator + 1);
}

function summarizeCustomProperties(definitions, references) {
  const names = new Set([
    ...definitions.map(({ name }) => name),
    ...references.map(({ name }) => name),
  ]);
  return [...names].sort(compareStrings).map((name) => ({
    definitionCount: definitions.filter((entry) => entry.name === name).length,
    name,
    referenceCount: references.filter((entry) => entry.name === name).length,
  }));
}

function countBy(entries, property, nullValue = "unknown") {
  const counts = new Map();
  for (const entry of entries) {
    const value = entry[property] ?? nullValue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([left], [right]) => compareStrings(left, right))
    .map(([name, count]) => ({ count, name }));
}

function pickOwner(entry) {
  return {
    ownerFamily: entry.ownerFamily,
    ownerPackage: entry.ownerPackage,
    plannedRemovalCheckpoint: entry.plannedRemovalCheckpoint,
  };
}

function postcssLocation(file, node) {
  return {
    column: node.source?.start?.column ?? 1,
    file,
    line: node.source?.start?.line ?? 1,
  };
}

function offsetLocation(file, source, offset) {
  const before = source.slice(0, Math.max(offset, 0));
  const lastNewline = before.lastIndexOf("\n");
  return {
    column: before.length - lastNewline,
    file,
    line: (before.match(/\n/g)?.length ?? 0) + 1,
  };
}

function lineCount(source) {
  if (source.length === 0) return 0;
  return (source.match(/\n/g)?.length ?? 0) + (source.endsWith("\n") ? 0 : 1);
}

function sum(entries, property) {
  return entries.reduce((total, entry) => total + entry[property], 0);
}

function uniqueObjects(entries) {
  const byValue = new Map(
    entries.map((entry) => [`${entry.name}\u0000${entry.value ?? ""}`, entry])
  );
  return [...byValue.values()].sort((left, right) =>
    compareStrings(`${left.name}:${left.value ?? ""}`, `${right.name}:${right.value ?? ""}`)
  );
}

function sortEntries(entries) {
  return [...entries].sort((left, right) => {
    const leftKey = entrySortKey(left);
    const rightKey = entrySortKey(right);
    return compareStrings(leftKey, rightKey);
  });
}

function entrySortKey(entry) {
  return [
    entry.file ?? "",
    String(entry.line ?? 0).padStart(7, "0"),
    String(entry.column ?? 0).padStart(5, "0"),
    entry.debtKind ?? entry.exceptionKind ?? "",
    entry.selector ??
      entry.property ??
      entry.name ??
      entry.className ??
      entry.attribute ??
      entry.utility ??
      "",
    String(entry.referenceIndex ?? 0).padStart(4, "0"),
  ].join("\u0000");
}

async function collectFiles(directory) {
  const entries = (await readdir(directory, { withFileTypes: true })).sort((left, right) =>
    compareStrings(left.name, right.name)
  );
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(entryPath)));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function repositoryPath(projectRoot, absolutePath) {
  return path.relative(projectRoot, absolutePath).split(path.sep).join("/");
}

function compareStrings(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
