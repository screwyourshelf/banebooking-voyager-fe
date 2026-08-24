import { readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";
import { analyzeStylingSource } from "./analyze.mjs";
import { loadStylingGuardContract } from "./contract.mjs";

const baselineSchemaVersion = 2;

export async function checkStylingProductionTree(projectRoot) {
  const contract = await loadStylingGuardContract();
  const { diagnostics, sourcePaths } = await analyzeProductionStylingTree(projectRoot, contract);
  const baselinePath = path.join(projectRoot, contract.productionTree.legacyBaselinePath);
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const expectedDiagnostics = readBaselineDiagnostics(baseline, baselinePath, contract);

  assertProductionStylingDiagnosticsMatch(expectedDiagnostics, diagnostics);

  const diagnosticCountsByRule = Object.fromEntries(
    contract.productionTree.enforcedRuleIds.map((ruleId) => [
      ruleId,
      diagnostics.filter((diagnostic) => diagnostic.ruleId === ruleId).length,
    ])
  );

  return {
    diagnosticCount: diagnostics.length,
    diagnosticCountsByRule,
    sourceFileCount: sourcePaths.length,
  };
}

export async function analyzeProductionStylingTree(projectRoot, contract) {
  const activeContract = contract ?? (await loadStylingGuardContract());
  const enforcedRuleIds = new Set(activeContract.productionTree.enforcedRuleIds);
  const sourcePaths = await collectProductionStylingSourcePaths(projectRoot, activeContract);
  const diagnostics = [];

  for (const sourcePath of sourcePaths) {
    const source = await readFile(path.join(projectRoot, sourcePath), "utf8");
    diagnostics.push(
      ...analyzeStylingSource({ contract: activeContract, source, sourcePath })
        .filter(({ ruleId }) => enforcedRuleIds.has(ruleId))
        .map(normalizeDiagnostic)
    );
  }

  return { diagnostics: sortDiagnostics(diagnostics), sourcePaths };
}

export async function collectProductionStylingSourcePaths(projectRoot, contract) {
  const activeContract = contract ?? (await loadStylingGuardContract());
  const files = [];

  for (const sourceRoot of activeContract.productionTree.sourceRoots) {
    files.push(...(await collectFiles(path.join(projectRoot, sourceRoot))));
  }

  return files
    .map((file) => repositoryPath(projectRoot, file))
    .filter((sourcePath) => isProductionStylingSource(sourcePath, activeContract.productionTree))
    .sort(compareStrings);
}

export function assertProductionStylingDiagnosticsMatch(expected, actual) {
  const normalizedExpected = sortDiagnostics(expected.map(normalizeDiagnostic));
  const normalizedActual = sortDiagnostics(actual.map(normalizeDiagnostic));
  if (isDeepStrictEqual(normalizedExpected, normalizedActual)) return;

  const added = multisetDifference(normalizedActual, normalizedExpected);
  const removed = multisetDifference(normalizedExpected, normalizedActual);
  const sections = ["Stylingguardene avviker fra den avtakende produksjonsbaselinen."];

  if (added.length > 0) {
    sections.push(formatDifference("Nye, ikke-registrerte avvik", added));
  }
  if (removed.length > 0) {
    sections.push(
      formatDifference(
        "Fjernede avvik som krever eksplisitt baselineoppdatering før de kan forbli slettet",
        removed
      )
    );
  }

  sections.push(
    "Kjør npm run styling:baseline:update bare etter en planlagt og verifisert baselinereduksjon."
  );
  throw new Error(sections.join("\n\n"));
}

function readBaselineDiagnostics(baseline, baselinePath, contract) {
  if (
    baseline?.schemaVersion !== baselineSchemaVersion ||
    !Array.isArray(baseline.source?.guardDiagnostics) ||
    baseline.source?.summary?.guardDiagnosticCount !== baseline.source.guardDiagnostics.length
  ) {
    throw new Error(
      `${baselinePath} må følge stylingbaseline schemaVersion ${baselineSchemaVersion} med samsvarende source.guardDiagnostics og summary.guardDiagnosticCount.`
    );
  }

  const enforcedRuleIds = new Set(contract.productionTree.enforcedRuleIds);
  for (const diagnostic of baseline.source.guardDiagnostics) {
    const hasExactShape = Object.keys(diagnostic).length === 5;
    const hasValidLocation =
      typeof diagnostic.file === "string" &&
      Number.isInteger(diagnostic.line) &&
      diagnostic.line > 0 &&
      Number.isInteger(diagnostic.column) &&
      diagnostic.column > 0;
    const hasValidRule = enforcedRuleIds.has(diagnostic.ruleId);
    const hasValidMessage = typeof diagnostic.message === "string" && diagnostic.message !== "";
    const hasProductionPath =
      contract.productionTree.sourceRoots.some((root) => diagnostic.file.startsWith(root)) &&
      isProductionStylingSource(diagnostic.file, contract.productionTree);

    if (
      !hasExactShape ||
      !hasValidLocation ||
      !hasValidRule ||
      !hasValidMessage ||
      !hasProductionPath
    ) {
      throw new Error(`${baselinePath} har en ugyldig production-tree diagnostic.`);
    }
  }

  const diagnostics = baseline.source.guardDiagnostics.map(normalizeDiagnostic);
  if (!isDeepStrictEqual(diagnostics, sortDiagnostics(diagnostics))) {
    throw new Error(`${baselinePath} har usorterte source.guardDiagnostics.`);
  }
  return diagnostics;
}

function isProductionStylingSource(sourcePath, productionTree) {
  if (productionTree.excludedFileSuffixes.some((suffix) => sourcePath.endsWith(suffix))) {
    return false;
  }
  return productionTree.sourceExtensions.some((extension) => sourcePath.endsWith(extension));
}

async function collectFiles(directory) {
  const entries = (await readdir(directory, { withFileTypes: true })).sort((left, right) =>
    left.name.localeCompare(right.name)
  );
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(entryPath)));
    else if (entry.isFile()) files.push(entryPath);
  }

  return files;
}

function normalizeDiagnostic({ column, file, line, message, ruleId }) {
  return { column, file, line, message, ruleId };
}

function sortDiagnostics(diagnostics) {
  return [...diagnostics].sort((left, right) =>
    compareStrings(diagnosticKey(left), diagnosticKey(right))
  );
}

function multisetDifference(left, right) {
  const rightCounts = new Map();
  for (const diagnostic of right) {
    const key = diagnosticKey(diagnostic);
    rightCounts.set(key, (rightCounts.get(key) ?? 0) + 1);
  }

  return left.filter((diagnostic) => {
    const key = diagnosticKey(diagnostic);
    const count = rightCounts.get(key) ?? 0;
    if (count === 0) return true;
    rightCounts.set(key, count - 1);
    return false;
  });
}

function formatDifference(label, diagnostics) {
  const limit = 20;
  const lines = diagnostics.slice(0, limit).map(formatDiagnostic);
  if (diagnostics.length > limit) lines.push(`… og ${diagnostics.length - limit} til.`);
  return `${label} (${diagnostics.length}):\n${lines.join("\n")}`;
}

function formatDiagnostic({ column, file, line, message, ruleId }) {
  return `${file}:${line}:${column} [${ruleId}] ${message}`;
}

function diagnosticKey(diagnostic) {
  return [
    diagnostic.file,
    String(diagnostic.line).padStart(7, "0"),
    String(diagnostic.column).padStart(5, "0"),
    diagnostic.ruleId,
    diagnostic.message,
  ].join("\u0000");
}

function repositoryPath(projectRoot, absolutePath) {
  return path.relative(projectRoot, absolutePath).split(path.sep).join("/");
}

function compareStrings(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
