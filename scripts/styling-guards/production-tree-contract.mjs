import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { analyzeStylingSourceDetails } from "./analyze.mjs";
import { loadStylingGuardContract } from "./contract.mjs";

export async function checkStylingProductionTree(projectRoot) {
  const contract = await loadStylingGuardContract();
  const { diagnostics, sourcePaths } = await analyzeProductionStylingTree(projectRoot, contract);
  assertNoProductionStylingDiagnostics(diagnostics);

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
  const analyses = [];

  for (const sourcePath of sourcePaths) {
    const source = await readFile(path.join(projectRoot, sourcePath), "utf8");
    analyses.push(analyzeStylingSourceDetails({ contract: activeContract, source, sourcePath }));
  }

  const projectReferences = new Set(
    analyses.flatMap(({ customProperties }) => customProperties.references.map(({ name }) => name))
  );
  const diagnostics = analyses
    .flatMap(({ diagnostics: sourceDiagnostics }) => sourceDiagnostics)
    .filter(({ ruleId }) => enforcedRuleIds.has(ruleId))
    .filter(
      (diagnostic) =>
        diagnostic.diagnosticKind !== "missing-project-reference" ||
        !projectReferences.has(diagnostic.customPropertyName)
    )
    .map(normalizeDiagnostic);

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

export function assertNoProductionStylingDiagnostics(actual) {
  const diagnostics = sortDiagnostics(actual.map(normalizeDiagnostic));
  if (diagnostics.length === 0) return;
  throw new Error(
    [
      "Styling-produksjonstreet har avvik fra sluttkontrakten.",
      formatDiagnostics("Ikke-tillatte avvik", diagnostics),
      "Rett eiergrensen eller oppdater den permanente kontrakten med et eksakt, begrunnet unntak.",
    ].join("\n\n")
  );
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

function formatDiagnostics(label, diagnostics) {
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
