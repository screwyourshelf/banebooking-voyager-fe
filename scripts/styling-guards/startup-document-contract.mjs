import { isDeepStrictEqual } from "node:util";
import postcss from "postcss";
import { parse } from "svelte/compiler";
import { customPropertyFunctions } from "./custom-property-references.mjs";
import { offsetLocation, walkAst } from "./svelte-ast.mjs";
import { analyzeImperativeDomStyling } from "./svelte-script-policy.mjs";

const startupPresentationAttributeNames = new Set([
  "align",
  "background",
  "bgcolor",
  "border",
  "color",
  "fill",
  "fill-opacity",
  "font-family",
  "font-size",
  "height",
  "opacity",
  "stroke",
  "stroke-width",
  "width",
]);

export function analyzeStartupDocumentSource({ contract, source, sourcePath }) {
  const startup = contract.startupDocument;
  const customProperties = { definitions: [], references: [] };
  const diagnostics = [];

  if (sourcePath !== startup.sourcePath) {
    return {
      customProperties,
      diagnostics: [
        diagnostic(
          contract.rules.cssApplication.id,
          "bare ADR-007-eieren src/app.html kan inneholde produksjons-HTML under src",
          { column: 1, line: 1 }
        ),
      ],
    };
  }

  let ast;
  try {
    ast = parse(source, { filename: sourcePath, modern: true });
  } catch (error) {
    return {
      customProperties,
      diagnostics: [
        diagnostic(
          contract.rules.cssApplication.id,
          `oppstartsdokumentet kunne ikke parses: ${error instanceof Error ? error.message : String(error)}`,
          { column: 1, line: 1 }
        ),
      ],
    };
  }

  const elements = [];
  const styleElements = [];
  const styleAttributes = [];
  const classChannels = [];
  const opaqueAttributeChannels = [];
  const presentationAttributes = [];
  const stylesheetLinks = [];

  walkAst(ast, (node) => {
    if (node.type !== "RegularElement") return;
    const attributes = staticAttributeMap(node.attributes ?? []);
    elements.push({ attributes, node, tag: node.name.toLowerCase() });

    if (node.name.toLowerCase() === "style") styleElements.push(node);
    if (node.name.toLowerCase() === "link" && attributes.rel?.toLowerCase() === "stylesheet") {
      stylesheetLinks.push(node);
    }

    for (const attribute of node.attributes ?? []) {
      if (attribute.type !== "Attribute") {
        opaqueAttributeChannels.push(attribute);
        continue;
      }
      const attributeName = attribute.name.toLowerCase();
      if (attributeName.startsWith("on") || startupPresentationAttributeNames.has(attributeName)) {
        presentationAttributes.push(attribute);
      }
      if (attributeName === "style") {
        styleAttributes.push({
          id: attributes.id ?? null,
          node: attribute,
          tag: node.name.toLowerCase(),
          value: staticAttributeValue(attribute),
        });
      }
      if (attributeName === "class") {
        classChannels.push(attribute);
      }
    }
  });

  if (classChannels.length > 0) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "oppstartsdokumentet tillater ingen class-kanal utenfor den eksakte inline-kontrakten",
        offsetLocation(source, classChannels[0].start ?? 0)
      )
    );
  }
  if (stylesheetLinks.length > 0) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "oppstartsdokumentet kan ikke avhenge av en manuelt koblet stylesheet",
        offsetLocation(source, stylesheetLinks[0].start ?? 0)
      )
    );
  }
  if (opaqueAttributeChannels.length > 0) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "oppstartsdokumentet tillater bare statiske HTML-attributter",
        offsetLocation(source, opaqueAttributeChannels[0].start ?? 0)
      )
    );
  }
  if (presentationAttributes.length > 0) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "oppstartsdokumentet tillater ikke presentasjons- eller eventattributter utenfor den eksakte stylekontrakten",
        offsetLocation(source, presentationAttributes[0].start ?? 0)
      )
    );
  }

  const actualStyleAttributes = styleAttributes.map(({ id, tag, value }) => ({ id, tag, value }));
  if (!isDeepStrictEqual(actualStyleAttributes, startup.styleAttributes)) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        `oppstartsdokumentets style-attributter avviker: ${firstDifference(startup.styleAttributes, actualStyleAttributes)}`,
        offsetLocation(source, styleAttributes[0]?.node?.start ?? 0)
      )
    );
  }

  for (const expectedElement of startup.elements) {
    const matchingElements = elements.filter(
      ({ attributes, tag }) =>
        tag === expectedElement.tag &&
        attributes[expectedElement.key.name] === expectedElement.key.value
    );
    const actualAttributes = matchingElements[0]?.attributes ?? null;
    if (
      matchingElements.length !== 1 ||
      !isDeepStrictEqual(actualAttributes, expectedElement.attributes)
    ) {
      diagnostics.push(
        diagnostic(
          contract.rules.cssApplication.id,
          `oppstartselementet ${expectedElement.tag}[${expectedElement.key.name}="${expectedElement.key.value}"] avviker fra ADR-007-kontrakten`,
          offsetLocation(source, matchingElements[0]?.node?.start ?? 0)
        )
      );
    }
  }

  for (const expectedMetadata of startup.metadata) {
    const matches = elements.filter(
      ({ attributes, tag }) => tag === "meta" && attributes.name === expectedMetadata.name
    );
    if (matches.length !== 1 || matches[0].attributes.content !== expectedMetadata.content) {
      diagnostics.push(
        diagnostic(
          contract.rules.cssApplication.id,
          `meta[name="${expectedMetadata.name}"] avviker fra oppstartsdokumentkontrakten`,
          offsetLocation(source, matches[0]?.node?.start ?? 0)
        )
      );
    }
  }

  if (styleElements.length !== 1 || (styleElements[0]?.attributes?.length ?? 0) !== 0) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        `oppstartsdokumentet skal ha nøyaktig én attributtløs styleblokk; fant ${styleElements.length}`,
        offsetLocation(source, styleElements[0]?.start ?? 0)
      )
    );
  }

  const styleElement = styleElements.length === 1 ? styleElements[0] : null;
  const styleSource = styleElement ? staticElementText(styleElement) : null;
  if (styleSource !== null) {
    let styleRoot;
    try {
      styleRoot = postcss.parse(styleSource, { from: sourcePath });
      const actualStylesheet = canonicalStylesheet(styleRoot);
      if (!isDeepStrictEqual(actualStylesheet, startup.stylesheet)) {
        diagnostics.push(
          diagnostic(
            contract.rules.cssApplication.id,
            `oppstartsdokumentets inline stylesheet avviker: ${firstDifference(startup.stylesheet, actualStylesheet)}`,
            offsetLocation(source, styleElement.start ?? 0)
          )
        );
      }

      styleRoot.walkDecls((declaration) => {
        for (const { name } of customPropertyFunctions(declaration.value)) {
          customProperties.references.push({
            column: declaration.source?.start?.column ?? 1,
            line:
              (offsetLocation(source, styleElement.start ?? 0).line ?? 1) +
              (declaration.source?.start?.line ?? 1) -
              1,
            name,
          });
        }
      });
    } catch (error) {
      diagnostics.push(
        diagnostic(
          contract.rules.cssApplication.id,
          `oppstartsdokumentets inline stylesheet kunne ikke parses: ${error instanceof Error ? error.message : String(error)}`,
          offsetLocation(source, styleElement.start ?? 0)
        )
      );
    }
  } else if (styleElement) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "oppstartsdokumentets styleblokk må være statisk tekst",
        offsetLocation(source, styleElement.start ?? 0)
      )
    );
  }

  const styleStart = styleElement?.start ?? Number.POSITIVE_INFINITY;
  const bodyStart = source.indexOf("<body");
  if (styleStart > bodyStart || bodyStart < 0) {
    diagnostics.push(
      diagnostic(
        contract.rules.cssApplication.id,
        "oppstartsdokumentets styleblokk skal ligge i head før body",
        offsetLocation(source, Number.isFinite(styleStart) ? styleStart : 0)
      )
    );
  }

  diagnostics.push(
    ...analyzeImperativeDomStyling({
      ast,
      contract,
      isFeatureOrRoute: true,
      isVisualization: false,
      source,
    }).map((entry) => ({
      ...entry,
      message: `oppstartsdokumentet ${entry.message}`,
      ruleId: contract.rules.cssApplication.id,
    }))
  );

  return { customProperties, diagnostics };
}

export function validateStartupDocumentThemeBindings({ contract, startupSource, tokenSource }) {
  const startup = contract.startupDocument;
  const diagnostics = [];
  const styleSource = extractSingleStyleSource(startupSource);
  const styleFunctions = [];

  if (styleSource !== null) {
    const root = postcss.parse(styleSource, { from: startup.sourcePath });
    root.walkDecls((declaration) => {
      for (const customPropertyFunction of customPropertyFunctions(declaration.value)) {
        styleFunctions.push({
          ...customPropertyFunction,
          column: declaration.source?.start?.column ?? 1,
          line: declaration.source?.start?.line ?? 1,
        });
      }
    });
  }

  const metadata = readMetadata(startupSource);
  const referencedTokens = new Set([
    ...styleFunctions.map(({ name }) => name),
    startup.themeColorToken,
  ]);
  const expectedTokens = new Set(startup.themeTokens);
  if (!isDeepStrictEqual([...referencedTokens].sort(), [...expectedTokens].sort())) {
    diagnostics.push({
      column: 1,
      file: startup.sourcePath,
      line: 1,
      message: `oppstartsdokumentets theme-bindinger avviker: ${firstDifference([...expectedTokens].sort(), [...referencedTokens].sort())}`,
      ruleId: contract.rules.customProperty.id,
    });
  }

  const tokenDefinitions = readStartupTokenDefinitions(tokenSource, contract);
  const actualThemeTokens = [...tokenDefinitions.keys()].sort();
  if (!isDeepStrictEqual(actualThemeTokens, [...startup.themeTokens].sort())) {
    diagnostics.push({
      column: 1,
      file: startup.tokenStylesheet,
      line: 1,
      message: `oppstartsthemets rollenavn avviker: ${firstDifference([...startup.themeTokens].sort(), actualThemeTokens)}`,
      ruleId: contract.rules.customProperty.id,
    });
  }
  for (const token of startup.themeTokens) {
    const definitions = tokenDefinitions.get(token) ?? [];
    if (
      definitions.length !== 1 ||
      definitions.some(({ isDirectThemeRoot }) => !isDirectThemeRoot)
    ) {
      diagnostics.push({
        column: definitions[0]?.column ?? 1,
        file: startup.tokenStylesheet,
        line: definitions[0]?.line ?? 1,
        message: `${token} skal ha nøyaktig én direkte :root-definisjon i oppstartstheme; fant ${definitions.length}`,
        ruleId: contract.rules.customProperty.id,
      });
    }
  }

  for (const reference of styleFunctions) {
    const definition = tokenDefinitions
      .get(reference.name)
      ?.find(({ isDirectThemeRoot }) => isDirectThemeRoot);
    if (reference.fallback === null) {
      diagnostics.push({
        column: reference.column,
        file: startup.sourcePath,
        line: reference.line,
        message: `${reference.name} mangler selvstendig fallback for pre-module-feil`,
        ruleId: contract.rules.customProperty.id,
      });
    } else if (definition && reference.fallback !== definition.value) {
      diagnostics.push({
        column: reference.column,
        file: startup.sourcePath,
        line: reference.line,
        message: `${reference.name} har fallback «${reference.fallback}», men theme-eieren definerer «${definition.value}»`,
        ruleId: contract.rules.customProperty.id,
      });
    }
  }

  const themeColor = metadata.get("theme-color") ?? [];
  const themeColorDefinition = tokenDefinitions
    .get(startup.themeColorToken)
    ?.find(({ isDirectThemeRoot }) => isDirectThemeRoot);
  if (
    themeColor.length !== 1 ||
    !themeColorDefinition ||
    themeColor[0].content !== themeColorDefinition.value
  ) {
    diagnostics.push({
      column: themeColor[0]?.column ?? 1,
      file: startup.sourcePath,
      line: themeColor[0]?.line ?? 1,
      message: `meta theme-color skal speile ${startup.themeColorToken} eksakt`,
      ruleId: contract.rules.customProperty.id,
    });
  }

  return diagnostics;
}

function canonicalStylesheet(root) {
  return canonicalNodes(root.nodes ?? []);
}

function canonicalNodes(nodes) {
  return nodes
    .filter((node) => node.type !== "comment")
    .map((node) => {
      if (node.type === "rule") {
        return {
          declarations: (node.nodes ?? [])
            .filter((child) => child.type !== "comment")
            .map((child) => {
              if (child.type !== "decl") {
                throw new Error(`Uventet ${child.type} i oppstartsregelen ${node.selector}.`);
              }
              return {
                important: Boolean(child.important),
                property: child.prop,
                value: child.value,
              };
            }),
          selector: node.selector.trim(),
          type: "rule",
        };
      }
      if (node.type === "atrule") {
        return {
          children: canonicalNodes(node.nodes ?? []),
          name: node.name.toLowerCase(),
          params: node.params.trim(),
          type: "at-rule",
        };
      }
      throw new Error(`Uventet ${node.type} i oppstartsdokumentets stylesheet.`);
    });
}

function readStartupTokenDefinitions(source, contract) {
  const definitions = new Map();
  const root = postcss.parse(source, { from: contract.startupDocument.tokenStylesheet });

  root.walkDecls((declaration) => {
    if (!declaration.prop.startsWith("--app-startup-")) return;
    const rule = declaration.parent?.type === "rule" ? declaration.parent : null;
    const layer = rule?.parent;
    const isDirectThemeRoot =
      rule?.selector.trim() === ":root" &&
      layer?.type === "atrule" &&
      layer.name === "layer" &&
      layer.params.trim() === "theme";
    const entries = definitions.get(declaration.prop) ?? [];
    entries.push({
      column: declaration.source?.start?.column ?? 1,
      isDirectThemeRoot,
      line: declaration.source?.start?.line ?? 1,
      value: declaration.value,
    });
    definitions.set(declaration.prop, entries);
  });

  return definitions;
}

function readMetadata(source) {
  const metadata = new Map();
  let ast;
  try {
    ast = parse(source, { filename: "startup-document", modern: true });
  } catch {
    return metadata;
  }
  walkAst(ast, (node) => {
    if (node.type !== "RegularElement" || node.name.toLowerCase() !== "meta") return;
    const attributes = staticAttributeMap(node.attributes ?? []);
    if (!attributes.name || attributes.content === undefined) return;
    const entries = metadata.get(attributes.name) ?? [];
    entries.push({
      ...offsetLocation(source, node.start ?? 0),
      content: attributes.content,
    });
    metadata.set(attributes.name, entries);
  });
  return metadata;
}

function extractSingleStyleSource(source) {
  let ast;
  try {
    ast = parse(source, { filename: "startup-document", modern: true });
  } catch {
    return null;
  }
  const styleElements = [];
  walkAst(ast, (node) => {
    if (node.type === "RegularElement" && node.name.toLowerCase() === "style") {
      styleElements.push(node);
    }
  });
  return styleElements.length === 1 ? staticElementText(styleElements[0]) : null;
}

function staticElementText(element) {
  const nodes = element.fragment?.nodes ?? [];
  if (!nodes.every((node) => node.type === "Text")) return null;
  return nodes.map((node) => node.data).join("");
}

function staticAttributeMap(attributes) {
  const entries = [];
  for (const attribute of attributes) {
    if (attribute.type !== "Attribute") continue;
    entries.push([attribute.name.toLowerCase(), staticAttributeValue(attribute)]);
  }
  return Object.fromEntries(entries.sort(([left], [right]) => left.localeCompare(right)));
}

function staticAttributeValue(attribute) {
  if (attribute.value === true) return "";
  if (!Array.isArray(attribute.value) || !attribute.value.every((part) => part.type === "Text")) {
    return null;
  }
  return attribute.value.map((part) => part.data).join("");
}

function diagnostic(ruleId, message, location) {
  return { ...location, message, ruleId };
}

function firstDifference(expected, actual, pointer = "contract") {
  if (isDeepStrictEqual(expected, actual)) return `${pointer}: ingen differanse funnet`;
  if (typeof expected !== typeof actual || expected === null || actual === null) {
    return `${pointer}: forventet ${preview(expected)}, fikk ${preview(actual)}`;
  }
  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual)) {
      return `${pointer}: forventet ${preview(expected)}, fikk ${preview(actual)}`;
    }
    if (expected.length !== actual.length) {
      return `${pointer}.length: forventet ${expected.length}, fikk ${actual.length}`;
    }
    for (let index = 0; index < expected.length; index += 1) {
      if (!isDeepStrictEqual(expected[index], actual[index])) {
        return firstDifference(expected[index], actual[index], `${pointer}[${index}]`);
      }
    }
  }
  if (typeof expected === "object") {
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
    for (const key of keys) {
      if (!Object.hasOwn(expected, key)) return `${pointer}.${key}: mangler i kontrakten`;
      if (!Object.hasOwn(actual, key)) return `${pointer}.${key}: mangler i kilden`;
      if (!isDeepStrictEqual(expected[key], actual[key])) {
        return firstDifference(expected[key], actual[key], `${pointer}.${key}`);
      }
    }
  }
  return `${pointer}: forventet ${preview(expected)}, fikk ${preview(actual)}`;
}

function preview(value) {
  if (typeof value === "symbol") return value.description ?? "symbol";
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return String(value);
  return serialized.length > 160 ? `${serialized.slice(0, 157)}...` : serialized;
}
