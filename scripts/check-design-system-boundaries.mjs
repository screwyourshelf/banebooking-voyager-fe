import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "src");
const recordsRoot = path.join(sourceRoot, "components", "records");
const recordCollectionHeaderPath = path.join(recordsRoot, "RecordCollectionHeader.tsx");
const filterSwitchPath = path.join(sourceRoot, "components", "controls", "FilterSwitch.tsx");
const allowedComponentFiles = new Set([filterSwitchPath]);
const allowedCssFiles = new Set([
  path.join(sourceRoot, "styles", "design-system", "patterns.css"),
  path.join(sourceRoot, "styles", "design-system", "responsive.css"),
]);

const protectedClasses = [
  "record-collection",
  "record-collection__body",
  "record-collection__pagination",
  "record-collection__toolbar",
  "record-list",
  "record-list-state",
  "record-card",
  "record-card-row",
  "record-card__static",
  "record-card__trigger",
  "record-card__summary",
  "record-card__details",
  "record-card__actions",
  "record-card__accent",
  "record-card__eyebrow",
  "record-status",
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
  "record-filter-panel__reset",
  "filter-switch",
  "filter-switch__copy",
  "filter-switch__title",
  "filter-switch__description",
  "filter-switch__control",
];

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
      /from\s+["'](?:\.\/RecordFilterPanel|@\/components\/records\/RecordFilterPanel)["']/.test(
        source
      )
    ) {
      apiViolations.push({
        filePath,
        line: lineFor(source, source.search(/RecordFilterPanel/)),
        message: "importerer RecordFilterPanel direkte",
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

if (violations.length > 0 || apiViolations.length > 0) {
  console.error(
    "Record-lister og filtre har én lukket komponentvei gjennom src/components/records."
  );

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

  console.error(
    "Send toggle- og filterdata til RecordCollectionHeader/AdminEntityCollection; ikke bygg lokal JSX eller CSS."
  );
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
