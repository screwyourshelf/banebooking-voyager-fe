import { readFile, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";
import { format, resolveConfig } from "prettier";
import { measureProductionBuilds } from "./styling-baseline/production-measurement.mjs";
import { measureStylingSource } from "./styling-baseline/source-measurement.mjs";

const baselineSchemaVersion = 2;
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = path.join(projectRoot, "docs/styling-baseline.json");
const mode = readMode(process.argv.slice(2));
const source = await measureStylingSource(projectRoot);

if (mode === "check") {
  const storedBaseline = JSON.parse(await readFile(baselinePath, "utf8"));
  validateBaseline(storedBaseline);
  if (!isDeepStrictEqual(storedBaseline.source, source)) {
    const difference = findFirstDifference(storedBaseline.source, source, "source");
    throw new Error(
      [
        "Stylingbaselinen avviker fra kildetreet.",
        difference,
        "Kjør npm run styling:baseline:update etter en planlagt, verifisert baselinereduksjon.",
      ].join("\n")
    );
  }
  console.log(formatSourceSummary("Stylingbaselinen matcher kildetreet", source));
} else {
  const productionBuilds = await measureProductionBuilds(projectRoot);
  const baseline = {
    schemaVersion: baselineSchemaVersion,
    source,
    productionBuilds,
  };
  const prettierConfig = (await resolveConfig(baselinePath)) ?? {};
  const formattedBaseline = await format(JSON.stringify(baseline), {
    ...prettierConfig,
    filepath: baselinePath,
    parser: "json",
  });
  await writeFile(baselinePath, formattedBaseline);
  console.log(formatSourceSummary("Stylingbaselinen er oppdatert", source));
  for (const build of productionBuilds) {
    console.log(
      [
        build.host,
        `initial CSS ${formatKiB(build.initialCssGzipBytes)}`,
        `initial JS ${formatKiB(build.initialJavaScriptGzipBytes)}`,
        `largest lazy JS ${formatKiB(build.largestLazyJavaScript.gzipBytes)}`,
        `JS chunks ${build.javaScriptChunkCount}`,
      ].join(" | ")
    );
  }
}

function readMode(arguments_) {
  if (arguments_.length !== 1 || !["--check", "--write"].includes(arguments_[0])) {
    throw new Error(
      "Bruk --check for deterministisk sammenligning eller --write etter ferske produksjonsbuilds."
    );
  }
  return arguments_[0].slice(2);
}

function validateBaseline(baseline) {
  if (
    baseline?.schemaVersion !== baselineSchemaVersion ||
    !baseline.source?.summary ||
    !Array.isArray(baseline.source?.legacyDebt) ||
    !Array.isArray(baseline.source?.guardDiagnostics) ||
    !Array.isArray(baseline.productionBuilds) ||
    baseline.productionBuilds.length !== 2
  ) {
    throw new Error(
      `docs/styling-baseline.json følger ikke stylingbaseline schemaVersion ${baselineSchemaVersion}.`
    );
  }
}

function findFirstDifference(expected, actual, pointer) {
  if (Object.is(expected, actual)) return `${pointer}: ingen enkeltdifferanse funnet`;
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
        return findFirstDifference(expected[index], actual[index], `${pointer}[${index}]`);
      }
    }
  }
  if (typeof expected === "object") {
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
    for (const key of keys) {
      if (!Object.hasOwn(expected, key)) return `${pointer}.${key}: mangler i baseline`;
      if (!Object.hasOwn(actual, key)) return `${pointer}.${key}: finnes ikke lenger i kilden`;
      if (!isDeepStrictEqual(expected[key], actual[key])) {
        return findFirstDifference(expected[key], actual[key], `${pointer}.${key}`);
      }
    }
  }
  return `${pointer}: forventet ${preview(expected)}, fikk ${preview(actual)}`;
}

function preview(value) {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return String(value);
  return serialized.length > 180 ? `${serialized.slice(0, 177)}...` : serialized;
}

function formatSourceSummary(label, measuredSource) {
  const { summary } = measuredSource;
  return [
    label,
    `${summary.cssFileCount} CSS-filer / ${summary.cssLineCount} linjer`,
    `${summary.cssRuleCount} regler / ${summary.selectorCount} selektorer`,
    `${summary.legacyDebtCount} legacyavvik`,
    `${summary.visualizationExceptionCount} visualiseringsunntakskandidater`,
  ].join(" | ");
}

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB gzip`;
}
