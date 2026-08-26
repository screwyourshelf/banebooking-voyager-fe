import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const targetRoots = [
  path.join(sourceRoot, "routes"),
  path.join(sourceRoot, "params"),
  path.join(sourceRoot, "lib", "contracts"),
  path.join(sourceRoot, "lib", "domain"),
  path.join(sourceRoot, "lib", "features"),
  path.join(sourceRoot, "lib", "platform"),
  path.join(sourceRoot, "lib", "ui"),
];
const visualizationGeometryOwners = new Set([
  "src/lib/features/statistics/StatisticsDistribution.svelte",
  "src/lib/features/statistics/StatisticsHourChart.svelte",
  "src/lib/features/statistics/StatisticsMonthChart.svelte",
]);
const violations = [];

await checkBootstrapTemplate();

for (const targetRoot of targetRoots) {
  for (const filePath of await collectSourceFiles(targetRoot)) {
    const source = await readFile(filePath, "utf8");
    const relativePath = path.relative(root, filePath);
    const normalizedPath = relativePath.split(path.sep).join("/");
    const imports = [...source.matchAll(/(?:from\s+|import\s*\()["']([^"']+)["']/g)].map(
      (match) => match[1]
    );

    for (const specifier of imports) {
      const target = resolveInternalTarget(normalizedPath, specifier);

      if (specifier === "@" || specifier.startsWith("@/")) {
        report(
          relativePath,
          source,
          specifier,
          "det fjernede @-aliaset kan ikke brukes til å omgå laggrensene"
        );
      }

      if (specifier === "bits-ui" && !normalizedPath.startsWith("src/lib/ui/primitives/")) {
        report(relativePath, source, specifier, "bits-ui kan bare importeres fra ui/primitives");
      }

      if (
        (specifier.startsWith("@supabase/") || specifier.startsWith("@sentry/")) &&
        !normalizedPath.startsWith("src/lib/platform/")
      ) {
        report(
          relativePath,
          source,
          specifier,
          "Supabase og Sentry kan bare importeres fra platformlaget"
        );
      }

      checkInternalLayerBoundary(relativePath, normalizedPath, source, specifier, target);

      if (
        !normalizedPath.endsWith(".client.ts") &&
        !normalizedPath.endsWith(".client.js") &&
        !normalizedPath.endsWith(".client.svelte") &&
        !normalizedPath.includes(".test.") &&
        /(?:^|\/)\w[\w-]*\.client(?:\.[jt]s)?$/.test(specifier) &&
        !isExplicitClientImport(source, specifier)
      ) {
        report(
          relativePath,
          source,
          specifier,
          "universal kode kan ikke importere browser-only moduler"
        );
      }
    }

    if (
      normalizedPath.startsWith("src/lib/contracts/") &&
      imports.some((specifier) => !specifier.startsWith("."))
    ) {
      report(
        relativePath,
        source,
        imports.find((specifier) => !specifier.startsWith(".")) ?? "import",
        "contracts kan bare importere andre transportkontrakter relativt"
      );
    }

    if (normalizedPath.startsWith("src/lib/domain/")) {
      const browserGlobalMatch = source.match(
        /\b(?:document|localStorage|navigator|sessionStorage|window)\b/
      );
      if (browserGlobalMatch) {
        report(
          relativePath,
          source,
          browserGlobalMatch[0],
          "domain skal være ren og uten browser-globals"
        );
      }

      const frameworkImport = imports.find(
        (specifier) => specifier === "svelte" || specifier.startsWith("@sveltejs/")
      );
      if (frameworkImport) {
        report(relativePath, source, frameworkImport, "domain skal være rammeverksuavhengig");
      }
    }

    if (
      !normalizedPath.startsWith("src/lib/platform/storage/") &&
      source.match(/\b(?:localStorage|sessionStorage)\b/)
    ) {
      const storageMatch = source.match(/\b(?:localStorage|sessionStorage)\b/);
      report(
        relativePath,
        source,
        storageMatch?.[0] ?? "storage",
        "browser storage kan bare brukes fra platform/storage"
      );
    }

    if (filePath.endsWith(".svelte")) {
      const fetchMatch = source.match(/\bfetch\s*\(/);
      if (fetchMatch) {
        report(relativePath, source, fetchMatch[0], "Svelte-komponenter kan ikke gjøre HTTP-kall");
      }

      const legacyMatch = source.match(/createEventDispatcher|\bon:[a-z]+\s*=|<slot\b/);
      if (legacyMatch) {
        report(relativePath, source, legacyMatch[0], "ny Svelte-kode må bruke runes og snippets");
      }

      if (
        normalizedPath.startsWith("src/lib/features/") &&
        !visualizationGeometryOwners.has(normalizedPath) &&
        /<style(?:\s|>)/.test(source)
      ) {
        report(relativePath, source, "<style", "features kan ikke definere lokal produktstyling");
      }

      if (normalizedPath.startsWith("src/lib/ui/primitives/") && /<style(?:\s|>)/.test(source)) {
        report(
          relativePath,
          source,
          "<style",
          "primitives skal styles gjennom designsystemets sentrale CSS"
        );
      }

      if (
        !normalizedPath.startsWith("src/lib/ui/primitives/") &&
        source.includes("data-ui-primitive")
      ) {
        report(
          relativePath,
          source,
          "data-ui-primitive",
          "primitiveanatomi kan bare defineres i ui/primitives"
        );
      }

      if (
        (normalizedPath.startsWith("src/lib/features/") ||
          normalizedPath.startsWith("src/routes/")) &&
        /\bdata-(?:ui|part)\s*=/.test(source)
      ) {
        report(
          relativePath,
          source,
          source.match(/\bdata-(?:ui|part)\s*=/)?.[0] ?? "data-ui",
          "routes og features skal komponere offentlig UI fremfor å definere produktanatomi"
        );
      }
    }
  }
}

function checkInternalLayerBoundary(relativePath, importer, source, specifier, target) {
  if (!target) return;

  if (importer.startsWith("src/routes/") && target.startsWith("src/lib/features/")) {
    const targetSegments = target.split("/");
    const usesPublicFeatureEntry =
      targetSegments.length === 4 ||
      (targetSegments.length === 5 && targetSegments.at(-1) === "index");
    if (!usesPublicFeatureEntry) {
      report(relativePath, source, specifier, "routes må bruke featurets offentlige inngang");
    }
  }

  if (importer.startsWith("src/lib/features/")) {
    const importerSegments = importer.split("/");
    const ownFeature = importerSegments.length > 4 ? importerSegments[3] : undefined;
    const importedFeature = target.startsWith("src/lib/features/")
      ? target.split("/")[3]
      : undefined;

    if (ownFeature && importedFeature && ownFeature !== importedFeature) {
      report(relativePath, source, specifier, "features kan ikke importere andre features");
    }
    if (target.startsWith("src/lib/ui/") && !isPublicUiEntry(target)) {
      report(
        relativePath,
        source,
        specifier,
        "features må bruke det offentlige UI-API-et fra $lib/ui"
      );
    }
    if (target.startsWith("src/routes/")) {
      report(relativePath, source, specifier, "features kan ikke importere routes");
    }
  }

  if (importer.startsWith("src/lib/ui/")) {
    if (isProductLayer(target) && !isWithin(target, "src/lib/ui")) {
      report(
        relativePath,
        source,
        specifier,
        "UI-laget kan ikke importere produkt- eller platformlag"
      );
    }
    if (
      importer.startsWith("src/lib/ui/primitives/") &&
      target.startsWith("src/lib/ui/patterns/")
    ) {
      report(relativePath, source, specifier, "UI-primitives kan ikke avhenge av patterns");
    }
  }

  if (importer.startsWith("src/lib/domain/") && !isWithin(target, "src/lib/domain")) {
    if (!isWithin(target, "src/lib/contracts")) {
      report(relativePath, source, specifier, "domain kan bare importere domain og contracts");
    }
  }

  if (importer.startsWith("src/lib/platform/") && isProductLayer(target)) {
    if (!isWithin(target, "src/lib/platform")) {
      report(relativePath, source, specifier, "platform kan bare importere andre platformmoduler");
    }
  }

  if (importer.startsWith("src/lib/contracts/") && !isWithin(target, "src/lib/contracts")) {
    report(relativePath, source, specifier, "contracts kan bare importere andre contracts");
  }
}

function resolveInternalTarget(importer, specifier) {
  if (specifier === "$lib") return "src/lib";
  if (specifier.startsWith("$lib/")) return `src/lib/${specifier.slice("$lib/".length)}`;
  if (specifier === "@") return "src";
  if (specifier.startsWith("@/")) return `src/${specifier.slice(2)}`;
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    return path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier));
  }
  return null;
}

function isPublicUiEntry(target) {
  return target === "src/lib/ui" || target === "src/lib/ui/index";
}

function isProductLayer(target) {
  return /^(?:src\/routes|src\/lib\/(?:contracts|domain|features|platform|ui))(?:\/|$)/.test(
    target
  );
}

function isWithin(target, directory) {
  return target === directory || target.startsWith(`${directory}/`);
}

if (violations.length > 0) {
  console.error("Arkitekturgrenser brutt:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("SvelteKit-arkitekturgrensene er intakte.");

async function checkBootstrapTemplate() {
  const filePath = path.join(sourceRoot, "app.html");
  const source = await readFile(filePath, "utf8");
  const relativePath = path.relative(root, filePath);

  const originWideStorageMatch = source.match(/\blocalStorage\b|\b(?:window\.)?caches\b/);
  if (originWideStorageMatch) {
    report(
      relativePath,
      source,
      originWideStorageMatch[0],
      "bootstrap kan ikke lese eller slette origin-delt lagring"
    );
  }

  const sessionStorageCalls = [
    ...source.matchAll(/\bsessionStorage\.([A-Za-z]+)\s*\(\s*([^,\s)]+)/g),
  ];
  const sessionStorageReferences = source.match(/\bsessionStorage\b/g) ?? [];

  if (sessionStorageCalls.length !== sessionStorageReferences.length) {
    report(
      relativePath,
      source,
      "sessionStorage",
      "bootstrap kan bare bruke eksplisitte sessionStorage-kall"
    );
  }

  for (const call of sessionStorageCalls) {
    const [, method, firstArgument] = call;
    if (!new Set(["getItem", "setItem"]).has(method) || firstArgument !== "recoveryStorageKey") {
      report(
        relativePath,
        source,
        call[0],
        "bootstrap kan bare lese og skrive sin private recoveryStorageKey"
      );
    }
  }
}

async function collectSourceFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectSourceFiles(entryPath)));
    if (entry.isFile() && /\.(?:svelte|ts|js)$/.test(entry.name)) files.push(entryPath);
  }
  return files;
}

function report(relativePath, source, needle, message) {
  const index = source.indexOf(needle);
  const line = index < 0 ? 1 : source.slice(0, index).split("\n").length;
  violations.push(`${relativePath}:${line} ${message}`);
}

function isExplicitClientImport(source, specifier) {
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const dynamicImport = new RegExp(`import\\(\\s*["']${escaped}["']\\s*\\)`).test(source);
  const browserLifecycle = /\b(?:onMount|browser)\b|\$effect\s*\(/.test(source);
  return dynamicImport && browserLifecycle;
}
