import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "src");
const featuresRoot = path.join(sourceRoot, "features");
const stylesheetEntryPath = path.join(sourceRoot, "index.css");
const tokensPath = path.join(sourceRoot, "styles", "design-system", "tokens.css");
const recordsRoot = path.join(sourceRoot, "components", "records");
const tournamentRoot = path.join(sourceRoot, "features", "turnering");
const recordCollectionHeaderPath = path.join(recordsRoot, "RecordCollectionHeader.tsx");
const filterSwitchPath = path.join(sourceRoot, "components", "controls", "FilterSwitch.tsx");
const controlChoicePath = path.join(sourceRoot, "components", "controls", "ControlChoice.tsx");
const pagePath = path.join(sourceRoot, "components", "Page.tsx");
const pageHeaderPath = path.join(sourceRoot, "components", "layout", "PageHeader.tsx");
const adminEditorDialogPath = path.join(sourceRoot, "components", "admin", "AdminEditorDialog.tsx");
const loginPagePath = path.join(sourceRoot, "features", "auth", "pages", "LoginPage.tsx");
const allowedComponentFiles = new Set([
  filterSwitchPath,
  controlChoicePath,
  pagePath,
  pageHeaderPath,
  adminEditorDialogPath,
  loginPagePath,
]);
const allowedCssFiles = new Set([
  path.join(sourceRoot, "styles", "design-system", "patterns.css"),
  path.join(sourceRoot, "styles", "design-system", "responsive.css"),
]);

const protectedClasses = [
  "page-frame",
  "page-heading",
  "page-heading__eyebrow",
  "page-heading__title",
  "page-heading__description",
  "page-heading__support",
  "page-heading__actions",
  "control-surface",
  "control-choice",
  "record-collection",
  "record-collection__body",
  "record-collection__pagination",
  "record-collection__toolbar",
  "record-collection__context-action",
  "record-list",
  "record-list-state",
  "record-date-groups",
  "record-date-group",
  "record-date-group__heading",
  "record-card",
  "record-card-button",
  "record-card-row",
  "record-card__row",
  "record-card__row-action",
  "record-card__static",
  "record-card__trigger",
  "record-card__trigger-header",
  "record-card__disclosure-open-icon",
  "record-card__disclosure-close-icon",
  "record-card__summary",
  "record-card__copy",
  "record-card__title",
  "record-card__description",
  "record-card__leading-value",
  "record-card__time",
  "record-card__time-range",
  "record-card__details",
  "record-card__actions",
  "record-card__accent",
  "record-card__eyebrow",
  "record-facts",
  "record-status",
  "record-collection-skeleton",
  "record-collection-skeleton__row",
  "record-filter-panel",
  "record-filter-panel__top",
  "record-filter-panel__label",
  "record-filter-panel__search",
  "record-filter-panel__clear-search",
  "record-filter-panel__toggle",
  "record-filter-panel__count",
  "record-filter-panel__content",
  "record-filter-panel__group",
  "record-filter-panel__choices",
  "record-filter-panel__custom-control",
  "record-filter-panel__reset",
  "filter-switch",
  "filter-switch__copy",
  "filter-switch__title",
  "filter-switch__description",
  "filter-switch__control",
];

const compositionPrimitiveAllowlist = new Map([
  [
    "@/components/ui/card",
    new Set([
      path.join(featuresRoot, "arrangement-admin", "views", "ArrangementAdminOverview.tsx"),
      path.join(featuresRoot, "statistikk", "components", "Medlemsstatistikk.tsx"),
      path.join(featuresRoot, "statistikk", "components", "NøkkeltallGrid.tsx"),
    ]),
  ],
  [
    "@/components/ui/tabs",
    new Set([
      path.join(
        featuresRoot,
        "arrangement-admin",
        "views",
        "arrangement",
        "OpprettArrangementView.tsx"
      ),
      path.join(
        featuresRoot,
        "arrangement-admin",
        "views",
        "rediger-arrangement",
        "RedigerArrangementView.tsx"
      ),
    ]),
  ],
  [
    "@/components/ui/toggle-group",
    new Set([
      path.join(
        featuresRoot,
        "arrangement-admin",
        "views",
        "arrangement",
        "OpprettArrangementView.tsx"
      ),
      path.join(
        featuresRoot,
        "arrangement-admin",
        "views",
        "rediger-arrangement",
        "RedigerArrangementView.tsx"
      ),
    ]),
  ],
  ["@/components/ui/accordion", new Set()],
]);

const recipeAllowlist = new Set([
  path.join(featuresRoot, "arrangement-admin", "pages", "ArrangementPage.tsx"),
  path.join(featuresRoot, "arrangement-admin", "views", "ArrangementAdminOverview.tsx"),
  path.join(
    featuresRoot,
    "arrangement-admin",
    "views",
    "arrangement",
    "OpprettArrangementView.tsx"
  ),
  path.join(
    featuresRoot,
    "arrangement-admin",
    "views",
    "rediger-arrangement",
    "RedigerArrangementView.tsx"
  ),
]);

const strictPatternFiles = new Set([
  path.join(featuresRoot, "booking", "components", "BookingSelectionHeader.tsx"),
  path.join(featuresRoot, "booking", "components", "BookingSlotListAccordion.tsx"),
  path.join(featuresRoot, "booking", "components", "BookingSlotRow.tsx"),
  path.join(featuresRoot, "booking", "components", "BookingSlotSummary.tsx"),
  path.join(featuresRoot, "booking", "views", "booking", "BookingContent.tsx"),
  path.join(featuresRoot, "minside", "views", "mine-bookinger", "MineBookingerView.tsx"),
  path.join(featuresRoot, "minside", "views", "mine-bookinger", "MineBookingerContent.tsx"),
  path.join(featuresRoot, "minside", "views", "mine-bookinger", "MineBookingRow.tsx"),
]);

const sourceFiles = await collectFiles(sourceRoot);
const violations = [];
const apiViolations = [];

for (const filePath of sourceFiles) {
  const extension = path.extname(filePath);
  const isComponentSource = extension === ".tsx";
  const isStylesheet = extension === ".css";

  if (!isComponentSource && !isStylesheet) continue;

  const source = await readFile(filePath, "utf8");

  if (isComponentSource) {
    if (filePath.startsWith(`${featuresRoot}${path.sep}`)) {
      for (const [moduleName, allowlist] of compositionPrimitiveAllowlist) {
        const modulePattern = new RegExp(
          `from\\s+["']${moduleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`
        );
        const index = source.search(modulePattern);

        if (index >= 0 && !allowlist.has(filePath)) {
          apiViolations.push({
            filePath,
            line: lineFor(source, index),
            message: `importerer rå ${moduleName}; bruk den delte side-, kontroll- eller record-komposisjonen`,
          });
        }
      }

      const recipeIndex = source.search(/from\s+["']@\/styles\/recipes["']/);
      if (recipeIndex >= 0 && !recipeAllowlist.has(filePath)) {
        apiViolations.push({
          filePath,
          line: lineFor(source, recipeIndex),
          message: "lager feature-komposisjon via recipes; bruk det beskyttede designsystem-API-et",
        });
      }
    }

    if (strictPatternFiles.has(filePath)) {
      const localStyleIndex = source.search(/\b(?:className|style)\s*=/);
      if (localStyleIndex >= 0) {
        apiViolations.push({
          filePath,
          line: lineFor(source, localStyleIndex),
          message: "har lokal styling i en beskyttet komposisjon",
        });
      }
    }

    if (
      !filePath.startsWith(`${tournamentRoot}${path.sep}`) &&
      /type\s*=\s*["'](?:date|datetime-local)["']/.test(source)
    ) {
      const index = source.search(/type\s*=\s*["'](?:date|datetime-local)["']/);
      apiViolations.push({
        filePath,
        line: lineFor(source, index),
        message: "bruker et rått dato-/tidspunktfelt",
      });
    }

    if (
      filePath !== recordCollectionHeaderPath &&
      /from\s+["']@\/components\/controls\/FilterSwitch["']/.test(source)
    ) {
      apiViolations.push({
        filePath,
        line: lineFor(source, source.search(/@\/components\/controls\/FilterSwitch/)),
        message: "importerer FilterSwitch direkte",
      });
    }

    if (
      filePath !== recordCollectionHeaderPath &&
      /from\s+["'](?:\.\/RecordControlPanel|@\/components\/records\/RecordControlPanel)["']/.test(
        source
      )
    ) {
      apiViolations.push({
        filePath,
        line: lineFor(source, source.search(/RecordControlPanel/)),
        message: "importerer RecordControlPanel direkte",
      });
    }

    for (const legacyComponent of ["RecordChoiceFilter", "RecordCollectionToolbar"]) {
      const index = source.search(new RegExp(`\\b${legacyComponent}\\b`));
      if (index >= 0) {
        apiViolations.push({
          filePath,
          line: lineFor(source, index),
          message: `bruker utgåtte ${legacyComponent}`,
        });
      }
    }
  }

  if (
    (isComponentSource &&
      (filePath.startsWith(`${recordsRoot}${path.sep}`) || allowedComponentFiles.has(filePath))) ||
    (isStylesheet && allowedCssFiles.has(filePath))
  ) {
    continue;
  }

  for (const protectedClass of protectedClasses) {
    const pattern = classPattern(protectedClass, isStylesheet);

    for (const match of source.matchAll(pattern)) {
      violations.push({
        filePath,
        line: lineFor(source, match.index),
        protectedClass,
      });
    }
  }

  const localFilterPattern = isStylesheet
    ? /\.([A-Za-z0-9_-]*filter-panel[A-Za-z0-9_-]*)/g
    : /className\s*=\s*["'][^"']*\b([A-Za-z0-9_-]*filter-panel[A-Za-z0-9_-]*)\b[^"']*["']/g;

  for (const match of source.matchAll(localFilterPattern)) {
    const localClass = match[1];
    if (protectedClasses.includes(localClass)) continue;

    violations.push({
      filePath,
      line: lineFor(source, match.index),
      protectedClass: localClass,
    });
  }
}

const stylesheetViolations = await validateStylesheets(sourceFiles);

if (violations.length > 0 || apiViolations.length > 0 || stylesheetViolations.length > 0) {
  console.error("Designsystemkontrollen feilet.");

  for (const violation of violations) {
    console.error(
      `- ${path.relative(projectRoot, violation.filePath)}:${violation.line} bruker ${violation.protectedClass}`
    );
  }

  for (const violation of apiViolations) {
    console.error(
      `- ${path.relative(projectRoot, violation.filePath)}:${violation.line} ${violation.message}`
    );
  }

  for (const violation of stylesheetViolations) {
    console.error(`- ${violation}`);
  }

  if (violations.length > 0 || apiViolations.length > 0) {
    console.error(
      "Bruk de beskyttede record- og filterkomponentene der legacy-designet fortsatt gjelder."
    );
  }
  process.exit(1);
}

console.log("Designsystem-grensene er intakte.");

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

function classPattern(className, stylesheet) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefix = stylesheet ? "\\." : "(^|[^A-Za-z0-9_-])";
  const suffix = "(?=$|[^A-Za-z0-9_-])";
  return new RegExp(`${prefix}${escaped}${suffix}`, "gm");
}

function lineFor(source, index) {
  return source.slice(0, Math.max(index, 0)).split("\n").length;
}

async function validateStylesheets(files) {
  const stylesheetFiles = files.filter((filePath) => path.extname(filePath) === ".css");
  const componentFiles = files.filter((filePath) =>
    [".html", ".ts", ".tsx"].includes(path.extname(filePath))
  );
  const sourceByPath = new Map(
    await Promise.all(files.map(async (filePath) => [filePath, await readFile(filePath, "utf8")]))
  );
  const componentSource = componentFiles.map((filePath) => sourceByPath.get(filePath)).join("\n");
  const stylesheetSource = stylesheetFiles.map((filePath) => sourceByPath.get(filePath)).join("\n");
  const issues = [];
  const reachableStylesheets = new Set();

  const entrySource = sourceByPath.get(stylesheetEntryPath) ?? "";
  if (/(?:^|\n)\s*(?::root|\.dark)\s*\{/.test(entrySource)) {
    issues.push(
      "src/index.css definerer temavariabler; legg dem i src/styles/design-system/tokens.css"
    );
  }
  if (/@layer\s+(?:base|components)\b/.test(entrySource)) {
    issues.push("src/index.css inneholder komponent-/base-styling; bruk designsystemfilene");
  }

  const tokensSource = sourceByPath.get(tokensPath) ?? "";
  if (!tokensSource) {
    issues.push("src/styles/design-system/tokens.css mangler");
  }

  function visitStylesheet(filePath) {
    if (reachableStylesheets.has(filePath)) return;
    reachableStylesheets.add(filePath);

    const source = sourceByPath.get(filePath);
    if (!source) {
      issues.push(
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
      issues.push(`${path.relative(projectRoot, filePath)} er ikke koblet til src/index.css`);
    }
  }

  const runtimeClasses = new Set(["ProseMirror", "selectedCell"]);

  for (const filePath of stylesheetFiles) {
    const source = sourceByPath.get(filePath);
    const classes = new Set(
      [...source.matchAll(/(?:^|[^A-Za-z0-9_-])\.([A-Za-z_][A-Za-z0-9_-]*)/g)].map(
        (match) => match[1]
      )
    );

    for (const className of classes) {
      if (runtimeClasses.has(className) || containsToken(componentSource, className)) continue;
      issues.push(
        `${path.relative(projectRoot, filePath)} definerer .${className}, men klassen brukes ikke i kildekoden`
      );
    }
  }

  const definedCssVariables = new Set(
    [...stylesheetSource.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((match) => match[1])
  );
  const runtimeCssVariables = new Set(
    [...componentSource.matchAll(/["'](--[A-Za-z0-9_-]+)["']\s*:/g)].map((match) => match[1])
  );

  for (const match of stylesheetSource.matchAll(/var\((--[A-Za-z0-9_-]+)/g)) {
    const variable = match[1];
    if (definedCssVariables.has(variable) || runtimeCssVariables.has(variable)) continue;
    issues.push(`CSS bruker ${variable}, men variabelen er ikke definert`);
  }

  const productTokenPattern = /^--(?:aas|activity|app|brand|clay|status)-/;
  const allSource = `${stylesheetSource}\n${componentSource}`;
  for (const variable of definedCssVariables) {
    if (!productTokenPattern.test(variable)) continue;
    const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const occurrences = allSource.match(new RegExp(escaped, "g"))?.length ?? 0;
    if (occurrences > 1) continue;
    issues.push(
      `${path.relative(projectRoot, tokensPath)} definerer ${variable}, men tokenet brukes ikke`
    );
  }

  const semanticPrefix =
    /^(?:action|admin|app|arrangement|booking|content|control|date|error|filter|guard|login|mine|mobile|navbar|news|page|query|record|section|settings|statistics|user|weather)-/;

  for (const filePath of componentFiles.filter((candidate) => candidate.endsWith(".tsx"))) {
    const source = sourceByPath.get(filePath);

    for (const match of source.matchAll(/className\s*=\s*["']([^"']+)["']/g)) {
      for (const className of match[1].split(/\s+/)) {
        if (!className || (!className.includes("__") && !semanticPrefix.test(className))) continue;
        if (definesClass(stylesheetSource, className)) continue;

        issues.push(
          `${path.relative(projectRoot, filePath)}:${lineFor(source, match.index)} bruker ${className} uten en tilhørende CSS-regel`
        );
      }
    }
  }

  return issues;
}

function containsToken(source, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9_-])${escaped}(?=$|[^A-Za-z0-9_-])`, "m").test(source);
}

function definesClass(source, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\.${escaped}(?=$|[^A-Za-z0-9_-])`, "m").test(source);
}
