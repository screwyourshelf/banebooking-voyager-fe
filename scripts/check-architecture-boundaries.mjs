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
const violations = [];

for (const targetRoot of targetRoots) {
  for (const filePath of await collectSourceFiles(targetRoot)) {
    const source = await readFile(filePath, "utf8");
    const relativePath = path.relative(root, filePath);
    const normalizedPath = relativePath.split(path.sep).join("/");
    const imports = [...source.matchAll(/(?:from\s+|import\s*\()["']([^"']+)["']/g)].map(
      (match) => match[1]
    );

    for (const specifier of imports) {
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

      if (
        normalizedPath.startsWith("src/lib/features/") &&
        specifier.startsWith("$lib/features/")
      ) {
        const ownFeature = normalizedPath.split("/")[3];
        const importedFeature = specifier.split("/")[2];
        if (ownFeature && importedFeature && ownFeature !== importedFeature) {
          report(relativePath, source, specifier, "features kan ikke importere andre features");
        }
      }

      if (normalizedPath.startsWith("src/lib/features/") && specifier.startsWith("$lib/ui/")) {
        report(
          relativePath,
          source,
          specifier,
          "features må bruke det offentlige UI-API-et fra $lib/ui"
        );
      }

      if (
        normalizedPath.startsWith("src/routes/") &&
        /^\$lib\/features\/[^/]+\/.+/.test(specifier) &&
        !specifier.endsWith("/index")
      ) {
        report(relativePath, source, specifier, "routes må bruke featurets offentlige inngang");
      }

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

      if (normalizedPath.startsWith("src/lib/features/") && /<style(?:\s|>)/.test(source)) {
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
    }
  }
}

if (violations.length > 0) {
  console.error("Arkitekturgrenser brutt:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("SvelteKit-arkitekturgrensene er intakte.");

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
