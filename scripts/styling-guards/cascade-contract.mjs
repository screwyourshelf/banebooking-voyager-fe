import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { analyzeCssCascadeLayers } from "./css-policy.mjs";
import { loadStylingGuardContract } from "./contract.mjs";

export async function checkStylingCascadeContract(projectRoot) {
  const contract = await loadStylingGuardContract();
  const expectedStylesheets = contract.css.productionStylesheets;
  const actualStylesheets = await collectStylesheets(projectRoot);
  const failures = stylesheetRegistrationFailures(expectedStylesheets, actualStylesheets);
  const layerRuleCounts = Object.fromEntries(contract.css.allowedLayers.map((layer) => [layer, 0]));
  let cssRuleCount = 0;

  for (const sourcePath of actualStylesheets) {
    const css = await readFile(path.join(projectRoot, sourcePath), "utf8");
    const analysis = analyzeCssCascadeLayers({ contract, css, sourcePath });
    cssRuleCount += analysis.ruleCount;

    for (const [layer, count] of Object.entries(analysis.ruleCounts)) {
      layerRuleCounts[layer] += count;
    }
    for (const diagnostic of analysis.diagnostics) {
      failures.push(
        `${sourcePath}:${diagnostic.line}:${diagnostic.column} [${diagnostic.ruleId}] ${diagnostic.message}`
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(`Styling cascade-kontrakten feilet:\n\n${failures.join("\n\n")}`);
  }

  return {
    cssRuleCount,
    layerRuleCounts,
    stylesheetCount: actualStylesheets.length,
  };
}

async function collectStylesheets(projectRoot) {
  const sourceRoot = path.join(projectRoot, "src");
  const files = await collectCssFiles(sourceRoot);
  return files
    .map((file) => path.relative(projectRoot, file).split(path.sep).join("/"))
    .sort((left, right) => left.localeCompare(right));
}

async function collectCssFiles(directory) {
  const entries = (await readdir(directory, { withFileTypes: true })).sort((left, right) =>
    left.name.localeCompare(right.name)
  );
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectCssFiles(entryPath)));
    else if (entry.isFile() && entry.name.endsWith(".css")) files.push(entryPath);
  }

  return files;
}

function stylesheetRegistrationFailures(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((stylesheet) => !actualSet.has(stylesheet));
  const unregistered = actual.filter((stylesheet) => !expectedSet.has(stylesheet));
  const failures = [];

  if (missing.length > 0) {
    failures.push(`Registrert produksjons-CSS finnes ikke: ${missing.join(", ")}.`);
  }
  if (unregistered.length > 0) {
    failures.push(`Uregistrert produksjons-CSS: ${unregistered.join(", ")}.`);
  }

  return failures;
}
