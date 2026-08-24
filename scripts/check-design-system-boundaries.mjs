import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "src");
const primitivesRoot = `${path.join(sourceRoot, "lib", "ui", "primitives")}${path.sep}`;
const stylesheetEntryPath = path.join(sourceRoot, "index.css");
const tokensPath = path.join(sourceRoot, "styles", "design-system", "tokens.css");
const sourceFiles = await collectFiles(sourceRoot);
const sourceByPath = new Map(
  await Promise.all(
    sourceFiles.map(async (filePath) => [filePath, await readFile(filePath, "utf8")])
  )
);
const stylesheetFiles = sourceFiles.filter((filePath) => path.extname(filePath) === ".css");
const componentFiles = sourceFiles.filter((filePath) =>
  [".html", ".svelte", ".ts"].includes(path.extname(filePath))
);
const componentSource = componentFiles.map((filePath) => sourceByPath.get(filePath)).join("\n");
const stylesheetSource = stylesheetFiles.map((filePath) => sourceByPath.get(filePath)).join("\n");
const runtimeClassNames = new Set(["dark", "light", "ProseMirror", "selectedCell"]);
const violations = [];

validateStylesheetGraph();
validateFeatureStyling();
validatePublicAnatomy();
validateCssVariables();

if (violations.length > 0) {
  console.error("Designsystemkontrollen feilet.");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Designsystem-grensene er intakte.");

function validateStylesheetGraph() {
  const entrySource = sourceByPath.get(stylesheetEntryPath) ?? "";
  if (/(?:^|\n)\s*(?::root|\.dark)\s*\{/.test(entrySource)) {
    violations.push(
      "src/index.css definerer temavariabler; legg dem i src/styles/design-system/tokens.css"
    );
  }
  if (/@layer\s+(?:base|components)\b/.test(entrySource)) {
    violations.push("src/index.css inneholder komponent-/base-styling; bruk designsystemfilene");
  }
  if (!sourceByPath.has(tokensPath)) {
    violations.push("src/styles/design-system/tokens.css mangler");
  }

  const reachableStylesheets = new Set();

  function visitStylesheet(filePath) {
    if (reachableStylesheets.has(filePath)) return;
    reachableStylesheets.add(filePath);

    const source = sourceByPath.get(filePath);
    if (!source) {
      violations.push(
        `${path.relative(projectRoot, filePath)} finnes ikke, men importeres av CSS-kjeden`
      );
      return;
    }

    for (const match of source.matchAll(/@import\s+["'](\.[^"']+\.css)["']/g)) {
      visitStylesheet(path.resolve(path.dirname(filePath), match[1]));
    }
  }

  visitStylesheet(stylesheetEntryPath);

  for (const filePath of stylesheetFiles) {
    if (!reachableStylesheets.has(filePath)) {
      violations.push(`${path.relative(projectRoot, filePath)} er ikke koblet til src/index.css`);
    }
  }
}

function validateFeatureStyling() {
  const featuresRoot = `${path.join(sourceRoot, "lib", "features")}${path.sep}`;
  const statisticsRoles = new Set(["key-value", "chart-value", "chart-label", "chart-meta"]);

  for (const filePath of componentFiles) {
    if (!filePath.startsWith(featuresRoot) || !filePath.endsWith(".svelte")) continue;

    const source = sourceByPath.get(filePath) ?? "";
    const relativePath = path.relative(projectRoot, filePath);
    const isStatisticsVisualization = filePath.startsWith(
      `${path.join(featuresRoot, "statistics")}${path.sep}`
    );

    for (const match of source.matchAll(/\bclass\s*=\s*["']([^"']+)["']/g)) {
      for (const className of match[1].split(/\s+/).filter(Boolean)) {
        if (isStatisticsVisualization && className.startsWith("statistics-")) {
          if (!definesClass(stylesheetSource, className)) {
            report(relativePath, source, match.index, `${className} mangler en sentral CSS-regel`);
          }
          continue;
        }

        report(
          relativePath,
          source,
          match.index,
          `bruker featurelokal klasse ${className}; bare datadrevet statistikkvisualisering er tillatt`
        );
      }
    }

    for (const match of source.matchAll(/\bstyle\s*=/g)) {
      if (isStatisticsVisualization) continue;
      report(
        relativePath,
        source,
        match.index,
        "bruker featurelokal inline-styling utenfor datadrevet visualisering"
      );
    }

    for (const match of source.matchAll(/data-stat-role\s*=\s*["']([^"']+)["']/g)) {
      if (statisticsRoles.has(match[1])) continue;
      report(relativePath, source, match.index, `bruker ukjent statistikkrolle «${match[1]}»`);
    }
  }
}

function validatePublicAnatomy() {
  const componentUiNames = new Set(
    [...componentSource.matchAll(/\bdata-ui\s*=\s*["']([^"']+)["']/g)].map((match) => match[1])
  );
  const stylesheetUiNames = new Set(
    [...stylesheetSource.matchAll(/\[data-ui\s*=\s*["']([^"']+)["']\]/g)].map((match) => match[1])
  );
  const componentPrimitiveNames = new Set(
    [...componentSource.matchAll(/\bdata-ui-primitive\s*=\s*["']([^"']+)["']/g)].map(
      (match) => match[1]
    )
  );
  const stylesheetPrimitiveNames = new Set(
    [...stylesheetSource.matchAll(/\[data-ui-primitive\s*=\s*["']([^"']+)["']\]/g)].map(
      (match) => match[1]
    )
  );
  const componentSlotNames = new Set(
    [...componentSource.matchAll(/\bdata-slot\s*=\s*["']([^"']+)["']/g)].map((match) => match[1])
  );
  const stylesheetSlotNames = new Set(
    [...stylesheetSource.matchAll(/\[data-slot\s*=\s*["']([^"']+)["']\]/g)].map((match) => match[1])
  );

  for (const uiName of componentUiNames) {
    if (!stylesheetUiNames.has(uiName)) {
      violations.push(
        `data-ui="${uiName}" brukes i en komponent, men mangler en sentral CSS-regel`
      );
    }
  }

  for (const primitiveName of componentPrimitiveNames) {
    if (
      !stylesheetPrimitiveNames.has(primitiveName) &&
      !primitiveHasComponentOwnedClass(primitiveName)
    ) {
      violations.push(
        `data-ui-primitive="${primitiveName}" mangler både en sentral CSS-regel og Tailwind-klasser på primitiveeierens element`
      );
    }
  }

  for (const uiName of stylesheetUiNames) {
    if (!componentUiNames.has(uiName)) {
      violations.push(`CSS definerer data-ui="${uiName}", men ingen Svelte-komponent bruker den`);
    }
  }

  for (const primitiveName of stylesheetPrimitiveNames) {
    if (!componentPrimitiveNames.has(primitiveName)) {
      violations.push(
        `CSS definerer data-ui-primitive="${primitiveName}", men ingen Svelte-primitive bruker den`
      );
    }
  }

  for (const slotName of stylesheetSlotNames) {
    if (!componentSlotNames.has(slotName)) {
      violations.push(
        `CSS definerer data-slot="${slotName}", men ingen Svelte-komponent bruker den`
      );
    }
  }

  const stylesheetClassNames = new Set(
    [...stylesheetSource.matchAll(/(?:^|[^A-Za-z0-9_-])\.([A-Za-z_][A-Za-z0-9_-]*)/g)].map(
      (match) => match[1]
    )
  );
  for (const className of stylesheetClassNames) {
    if (runtimeClassNames.has(className) || containsToken(componentSource, className)) continue;
    violations.push(`CSS definerer .${className}, men klassen brukes ikke i Svelte-kilden`);
  }

  // Valider at alle aktive Svelte-anatomier fortsatt har den forventede CSS-rekkevidden.
  for (const filePath of stylesheetFiles) {
    const source = sourceByPath.get(filePath) ?? "";
    for (const ruleMatch of source.matchAll(/([^{}]+)\{/g)) {
      const selectorBlock = ruleMatch[1].trim();
      if (!selectorBlock.includes("[data-part") || selectorBlock.startsWith("@")) continue;

      for (const selector of selectorBlock.split(",")) {
        const anchors = [
          ...selector.matchAll(
            /\[(?:data-ui|data-part|data-slot|data-layout|data-surface)(?:[^\]]*)\]/g
          ),
        ];

        for (let index = 1; index < anchors.length; index += 1) {
          const current = anchors[index];
          if (!current[0].startsWith("[data-part")) continue;

          const previous = anchors[index - 1];
          const between = selector.slice(previous.index + previous[0].length, current.index);
          if (!/\s/.test(between) || between.includes(">")) continue;

          violations.push(
            `${path.relative(projectRoot, filePath)}:${lineFor(source, ruleMatch.index)} har en ubundet ${current[0]}-selektor; bind komponentanatomien med direkte barn (>)`
          );
        }
      }
    }
  }
}

function validateCssVariables() {
  const definedCssVariables = new Set(
    [...stylesheetSource.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((match) => match[1])
  );
  const runtimeCssVariables = new Set(
    [...componentSource.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((match) => match[1])
  );

  for (const match of stylesheetSource.matchAll(/var\((--[A-Za-z0-9_-]+)/g)) {
    const variable = match[1];
    if (definedCssVariables.has(variable) || runtimeCssVariables.has(variable)) continue;
    violations.push(`CSS bruker ${variable}, men variabelen er ikke definert`);
  }

  const tokensSource = sourceByPath.get(tokensPath) ?? "";
  const tokenDependencies = new Map();
  for (const match of tokensSource.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g)) {
    const dependencies = tokenDependencies.get(match[1]) ?? new Set();
    for (const dependency of match[2].matchAll(/var\((--[A-Za-z0-9_-]+)/g)) {
      dependencies.add(dependency[1]);
    }
    tokenDependencies.set(match[1], dependencies);
  }

  const nonTokenSource = [
    ...stylesheetFiles
      .filter((filePath) => filePath !== tokensPath)
      .map((filePath) => sourceByPath.get(filePath) ?? ""),
    componentSource,
  ].join("\n");
  const reachableTokens = new Set(
    [...nonTokenSource.matchAll(/var\((--[A-Za-z0-9_-]+)/g)].map((match) => match[1])
  );
  const pendingTokens = [...reachableTokens];
  while (pendingTokens.length > 0) {
    const token = pendingTokens.pop();
    for (const dependency of tokenDependencies.get(token) ?? []) {
      if (reachableTokens.has(dependency)) continue;
      reachableTokens.add(dependency);
      pendingTokens.push(dependency);
    }
  }

  for (const token of tokenDependencies.keys()) {
    if (!reachableTokens.has(token)) {
      violations.push(
        `${path.relative(projectRoot, tokensPath)} definerer ${token}, men tokenet brukes ikke`
      );
    }
  }
}

function primitiveHasComponentOwnedClass(primitiveName) {
  const markerPattern = new RegExp(
    `\\bdata-ui-primitive\\s*=\\s*["']${escapeRegExp(primitiveName)}["']`
  );

  for (const [filePath, source] of sourceByPath) {
    if (!filePath.startsWith(primitivesRoot) || !filePath.endsWith(".svelte")) continue;

    for (const openingTag of source.matchAll(/<[A-Za-z][A-Za-z0-9_.:-]*(?:\s[^<>]*?)?>/gs)) {
      if (markerPattern.test(openingTag[0]) && /\bclass\s*=/.test(openingTag[0])) return true;
    }
  }

  return false;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(entryPath)));
    if (entry.isFile()) files.push(entryPath);
  }

  return files;
}

function report(relativePath, source, index, message) {
  violations.push(`${relativePath}:${lineFor(source, index)} ${message}`);
}

function lineFor(source, index) {
  return source.slice(0, Math.max(index, 0)).split("\n").length;
}

function definesClass(source, className) {
  const escaped = escapeRegExp(className);
  return new RegExp(`\\.${escaped}(?=$|[^A-Za-z0-9_-])`, "m").test(source);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsToken(source, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9_-])${escaped}(?=$|[^A-Za-z0-9_-])`, "m").test(source);
}
