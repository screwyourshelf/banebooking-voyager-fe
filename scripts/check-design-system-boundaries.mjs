import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "src");
const featuresRoot = path.join(sourceRoot, "features");
const stylesheetEntryPath = path.join(sourceRoot, "index.css");
const tokensPath = path.join(sourceRoot, "styles", "design-system", "tokens.css");
const recordsRoot = path.join(sourceRoot, "components", "records");
const recordCollectionHeaderPath = path.join(recordsRoot, "RecordCollectionHeader.tsx");
const filterSwitchPath = path.join(sourceRoot, "components", "controls", "FilterSwitch.tsx");
const controlChoicePath = path.join(sourceRoot, "components", "controls", "ControlChoice.tsx");
const dateTimeInputPath = path.join(
  featuresRoot,
  "turnering",
  "components",
  "internal",
  "DateTimeInput.tsx"
);
const pagePath = path.join(sourceRoot, "components", "Page.tsx");
const createActionPath = path.join(sourceRoot, "components", "actions", "CreateAction.tsx");
const sectionPath = path.join(sourceRoot, "components", "section", "index.tsx");
const collectionPartsPath = path.join(
  sourceRoot,
  "components",
  "collection",
  "CollectionParts.tsx"
);
const formRoot = path.join(sourceRoot, "components", "forms");
const statisticsFilterPath = path.join(
  featuresRoot,
  "statistikk",
  "components",
  "StatistikkFilter.tsx"
);
const tournamentScoreInputPath = path.join(
  featuresRoot,
  "turnering",
  "components",
  "internal",
  "ScoreInput.tsx"
);
const tournamentAdminSetupPath = path.join(
  featuresRoot,
  "turnering",
  "views",
  "admin",
  "AdminOppsettContent.tsx"
);
const editorDialogPath = path.join(sourceRoot, "components", "dialogs", "EditorDialog.tsx");
const loginPagePath = path.join(sourceRoot, "features", "auth", "pages", "LoginPage.tsx");
const loginPageLayoutPath = path.join(
  sourceRoot,
  "components",
  "navigation",
  "LoginPageLayout.tsx"
);
const allowedComponentFiles = new Set([
  filterSwitchPath,
  controlChoicePath,
  pagePath,
  createActionPath,
  sectionPath,
  collectionPartsPath,
  editorDialogPath,
  loginPagePath,
  loginPageLayoutPath,
]);
const allowedCssFiles = new Set([
  path.join(sourceRoot, "styles", "design-system", "patterns.css"),
  path.join(sourceRoot, "styles", "design-system", "responsive.css"),
]);

const protectedClasses = [
  "record-collection",
  "record-collection__body",
  "record-collection__pagination",
  "record-collection__context-action",
  "record-list",
  "record-list-state",
  "record-date-groups",
  "record-date-group",
  "record-date-group__heading",
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
];

const ambiguousPartNames = /__(?:copy|wrapper|container)(?=$|\s)/;
const modifierClass = /--[a-z0-9_-]+/i;
const utilityClass =
  /^(?:animate-|bg-|border-|col-|flex$|gap-|grid$|h-|hidden$|items-|justify-|m[trblxy]?-|max-w-|min-h-|min-w-|overflow-|p[trblxy]?-|rounded-|sr-only$|text-|w-)/;

const compositionPrimitiveAllowlist = new Map([
  ["@/components/ui/card", new Set()],
  ["@/components/ui/dialog", new Set()],
  ["@/components/ui/tabs", new Set()],
  ["@/components/ui/toggle-group", new Set()],
  ["@/components/ui/accordion", new Set()],
  ["@/components/ui/sheet", new Set()],
]);

const recipeAllowlist = new Set();
const statisticsTypographyRoles = new Set([
  "key-value",
  "chart-value",
  "chart-label",
  "chart-meta",
]);
const featureStyleAllowlist = new Set([
  path.join(featuresRoot, "statistikk", "components", "BookingerPerMånedChart.tsx"),
  path.join(featuresRoot, "statistikk", "components", "FordelingBarListe.tsx"),
  path.join(featuresRoot, "statistikk", "components", "TidPåDøgnetChart.tsx"),
]);
const formControlOutsideFieldAllowlist = new Map([
  [statisticsFilterPath, new Map([["Select", 1]])],
  [dateTimeInputPath, new Map([["Input", 1]])],
  [tournamentScoreInputPath, new Map([["Input", 1]])],
  [tournamentAdminSetupPath, new Map([["Input", 1]])],
]);
const strictPatternRoots = [path.join(featuresRoot, "arrangement-admin")];
const tournamentRoot = path.join(featuresRoot, "turnering");
const privateRecordRowPrimitives = new Set([
  "RecordAccordionCard",
  "RecordAccordionList",
  "RecordCard",
  "RecordCardActions",
  "RecordCardButton",
  "RecordCardDetails",
  "RecordCardStatic",
  "RecordCardSummary",
  "RecordCardTrigger",
  "RecordDateGroup",
  "RecordDateGroupHeading",
  "RecordDateGroupList",
  "RecordIdentity",
  "RecordSummaryCopy",
]);

const strictPatternFiles = new Set([
  path.join(featuresRoot, "booking", "components", "BookingSelectionHeader.tsx"),
  path.join(featuresRoot, "booking", "components", "BookingSlotListAccordion.tsx"),
  path.join(featuresRoot, "booking", "components", "BookingSlotRow.tsx"),
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
    for (const match of source.matchAll(/data-stat-role\s*=\s*["']([^"']+)["']/g)) {
      if (!statisticsTypographyRoles.has(match[1])) {
        apiViolations.push({
          filePath,
          line: lineFor(source, match.index),
          message: `bruker ukjent statistikkrolle «${match[1]}»`,
        });
      }
    }
  }

  if (isComponentSource && !filePath.includes(`${path.sep}components${path.sep}ui${path.sep}`)) {
    if (filePath.startsWith(`${featuresRoot}${path.sep}`)) {
      const localUiAnatomyIndex = source.search(/\bdata-(?:ui|part)\s*=/);
      if (localUiAnatomyIndex >= 0) {
        apiViolations.push({
          filePath,
          line: lineFor(source, localUiAnatomyIndex),
          message: "definerer lokal UI-anatomi; data-ui og data-part eies av en delt komponent",
        });
      }
    }

    for (const match of source.matchAll(/className\s*=\s*["']([^"']+)["']/g)) {
      const classNames = match[1].split(/\s+/).filter(Boolean);

      if (classNames.length > 1) {
        apiViolations.push({
          filePath,
          line: lineFor(source, match.index),
          message:
            "har flere lokale klasser på samme element; bruk én komponentidentitet og data-attributter",
        });
      }

      for (const className of classNames) {
        if (ambiguousPartNames.test(className)) {
          apiViolations.push({
            filePath,
            line: lineFor(source, match.index),
            message: `bruker det uklare delnavnet ${className}; velg et domeneord som intro, content eller actions`,
          });
        }

        if (modifierClass.test(className)) {
          apiViolations.push({
            filePath,
            line: lineFor(source, match.index),
            message: `koder variant i klassen ${className}; bruk et data-attributt`,
          });
        }

        if (utilityClass.test(className)) {
          apiViolations.push({
            filePath,
            line: lineFor(source, match.index),
            message: `bruker utility-klassen ${className}; legg regelen i designsystemets sentrale CSS`,
          });
        }
      }
    }
  }

  const tournamentStyleIndex = source.search(/\btournament-[a-z0-9_-]+/i);
  if (tournamentStyleIndex >= 0) {
    apiViolations.push({
      filePath,
      line: lineFor(source, tournamentStyleIndex),
      message: "bruker et eget tournament-stilprefiks; bruk appens generelle designsystem",
    });
  }

  if (isComponentSource) {
    if (filePath.startsWith(`${featuresRoot}${path.sep}`)) {
      if (!filePath.startsWith(`${tournamentRoot}${path.sep}`)) {
        const privateRecordModuleIndex = source.search(
          /from\s+["']@\/components\/records\/(?:RecordCard|RecordList)["']/
        );

        if (privateRecordModuleIndex >= 0) {
          apiViolations.push({
            filePath,
            line: lineFor(source, privateRecordModuleIndex),
            message: "importerer en intern radmodul; bruk Collection.Row og Collection.List",
          });
        }

        for (const match of source.matchAll(
          /import\s*\{([\s\S]*?)\}\s*from\s*["']@\/components\/records["']/g
        )) {
          const importedNames = match[1]
            .split(",")
            .map(
              (name) =>
                name
                  .trim()
                  .replace(/^type\s+/, "")
                  .split(/\s+as\s+/)[0]
            )
            .filter(Boolean);
          const privateImport = importedNames.find((name) => privateRecordRowPrimitives.has(name));

          if (privateImport) {
            apiViolations.push({
              filePath,
              line: lineFor(source, match.index),
              message: `importerer den interne radbyggeklossen ${privateImport}; bruk Collection.Row`,
            });
          }
        }
      }

      const isFeaturePage = filePath.includes(`${path.sep}pages${path.sep}`);

      const rawFormAnatomyIndex = source.search(
        /from\s+["']@\/components\/ui\/(?:field|label)["']|<label\b|<Label\b/
      );

      if (rawFormAnatomyIndex >= 0) {
        apiViolations.push({
          filePath,
          line: lineFor(source, rawFormAnatomyIndex),
          message: "lager lokal skjemaanatomi; bruk Form.Fields og Form.Field",
        });
      }

      for (const match of source.matchAll(/<Settings\.Row\b[\s\S]*?<\/Settings\.Row>/g)) {
        if (
          !/<(?:Input|Textarea|Select|DatoVelger|DatoFlervelger|DateTimeInput|ScoreInput|LazyTiptapEditor|Settings\.(?:ChoiceGroup|RadioGroup))\b/.test(
            match[0]
          )
        ) {
          continue;
        }

        apiViolations.push({
          filePath,
          line: lineFor(source, match.index),
          message: "legger et redigerbart felt i Settings.Row; bruk Form.Field",
        });
      }

      const allowedOutsideFormField = new Map(formControlOutsideFieldAllowlist.get(filePath) ?? []);
      for (const control of findControlsOutsideFormField(filePath, source)) {
        const remainingAllowance = allowedOutsideFormField.get(control.name) ?? 0;
        if (remainingAllowance > 0) {
          allowedOutsideFormField.set(control.name, remainingAllowance - 1);
          continue;
        }

        apiViolations.push({
          filePath,
          line: control.line,
          message: `bruker ${control.name} utenfor Form.Field; redigerbare kontroller må bruke den faste feltstrukturen`,
        });
      }

      if (isFeaturePage) {
        const hasApprovedPageShell =
          /<(?:Page|LoginPageLayout|ErrorShell|BanerOgGrenerWorkspace|BookingView|MineBookingerView)\b/.test(
            source
          );

        if (!hasApprovedPageShell) {
          apiViolations.push({
            filePath,
            line: 1,
            message: "mangler en godkjent side- eller viewstruktur",
          });
        }

        const directPageCreateIndex = source.search(
          /<Button\b[^>]*>[\s\S]{0,240}?\b(?:Nytt|Ny)\s+[A-ZÆØÅa-zæøå]/
        );

        if (directPageCreateIndex >= 0) {
          apiViolations.push({
            filePath,
            line: lineFor(source, directPageCreateIndex),
            message: "lager en lokal opprett-knapp; bruk createAction på Page",
          });
        }
      }

      const privateFamilyImportIndex = source.search(
        /from\s+["']@\/components\/(?:Page|admin|collection|dialogs|forms|section|settings)(?:[\/"'])/
      );

      if (privateFamilyImportIndex >= 0) {
        apiViolations.push({
          filePath,
          line: lineFor(source, privateFamilyImportIndex),
          message:
            "importerer en intern komponentfamilie; bruk det offentlige API-et fra @/components",
        });
      }

      const directPlusIconIndex = source.search(
        /import\s*\{[^}]*\bPlus\b[^}]*\}\s*from\s*["']lucide-react["']/
      );

      if (directPlusIconIndex >= 0) {
        apiViolations.push({
          filePath,
          line: lineFor(source, directPlusIconIndex),
          message: "bruker Plus-ikon direkte; bruk createAction på Page",
        });
      }

      const collectionCreateActionIndex = source.search(
        /<Collection\b[\s\S]{0,1200}?\bcreateAction\s*=/
      );

      if (collectionCreateActionIndex >= 0) {
        apiViolations.push({
          filePath,
          line: lineFor(source, collectionCreateActionIndex),
          message: "legger sidens opprettelseshandling i Collection; bruk createAction på Page",
        });
      }

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

      for (const match of source.matchAll(/className\s*=\s*["']([^"']+)["']/g)) {
        for (const className of match[1].split(/\s+/)) {
          if (/^(?:app|statistics)-/.test(className)) continue;
          apiViolations.push({
            filePath,
            line: lineFor(source, match.index),
            message: `bruker lokal utility-klasse ${className}; bruk designsystemets semantiske API`,
          });
        }
      }

      for (const match of source.matchAll(/className\s*=\s*\{/g)) {
        apiViolations.push({
          filePath,
          line: lineFor(source, match.index),
          message:
            "bygger lokale stylingvarianter dynamisk; bruk data-attributter i en sentral komponent",
        });
      }

      for (const match of source.matchAll(/\bstyle\s*=/g)) {
        if (featureStyleAllowlist.has(filePath)) continue;
        apiViolations.push({
          filePath,
          line: lineFor(source, match.index),
          message: "har lokal inline-styling; flytt uttrykket til designsystemet",
        });
      }
    }

    if (
      strictPatternFiles.has(filePath) ||
      strictPatternRoots.some((root) => filePath.startsWith(`${root}${path.sep}`))
    ) {
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
      filePath !== dateTimeInputPath &&
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

    for (const legacyComponent of [
      "RecordChoiceFilter",
      "RecordCollectionToolbar",
      "AdminPage",
      "RecordCollectionPage",
      "PageHeader",
      "PageCreateAction",
      "RecordCreateAction",
      "AdminWorkspace",
      "AdminEditorForm",
      "AdminSettingsForm",
      "AdminFormActions",
      "AdminFormSubmitButton",
      "PageSection",
      "CardSection",
      "SectionHeading",
    ]) {
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
      (filePath.startsWith(`${recordsRoot}${path.sep}`) ||
        filePath.startsWith(`${formRoot}${path.sep}`) ||
        allowedComponentFiles.has(filePath))) ||
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

function findControlsOutsideFormField(filePath, source) {
  const editableControls = new Set([
    "Input",
    "Textarea",
    "Select",
    "DatoVelger",
    "DatoFlervelger",
    "DateTimeInput",
    "ScoreInput",
    "LazyTiptapEditor",
  ]);
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const controls = [];

  function visit(node, insideFormField = false) {
    let tagName = null;

    if (ts.isJsxElement(node)) {
      tagName = node.openingElement.tagName.getText(sourceFile);
    } else if (ts.isJsxSelfClosingElement(node)) {
      tagName = node.tagName.getText(sourceFile);
    }

    if (tagName && editableControls.has(tagName) && !insideFormField) {
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      controls.push({ name: tagName, line: position.line + 1 });
    }

    const nextInsideFormField = insideFormField || tagName === "Form.Field";
    ts.forEachChild(node, (child) => visit(child, nextInsideFormField));
  }

  visit(sourceFile);
  return controls;
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

          issues.push(
            `${path.relative(projectRoot, filePath)}:${lineFor(source, ruleMatch.index)} har en ubundet ${current[0]}-selektor; bind komponentanatomien med direkte barn (>) så regelen ikke lekker til nestede komponenter`
          );
        }
      }
    }
  }

  const componentUiNames = new Set(
    [...componentSource.matchAll(/\bdata-ui\s*=\s*["']([^"']+)["']/g)].map((match) => match[1])
  );
  const stylesheetUiNames = new Set(
    [...stylesheetSource.matchAll(/\[data-ui\s*=\s*["']([^"']+)["']\]/g)].map((match) => match[1])
  );

  for (const uiName of componentUiNames) {
    if (stylesheetUiNames.has(uiName)) continue;
    issues.push(`data-ui="${uiName}" brukes i en komponent, men mangler en sentral CSS-regel`);
  }

  for (const uiName of stylesheetUiNames) {
    if (componentUiNames.has(uiName)) continue;
    issues.push(`CSS definerer data-ui="${uiName}", men ingen komponent bruker den`);
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
    /^(?:action|app|arrangement|booking|collection|content|control|date|editor|error|filter|guard|login|mine|mobile|navbar|news|page|query|record|section|settings|statistics|tournament|user|weather)-/;

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
