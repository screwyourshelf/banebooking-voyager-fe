import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeStylingSource } from "./styling-guards/analyze.mjs";
import { loadStylingGuardContract } from "./styling-guards/contract.mjs";
import {
  assertNoProductionStylingDiagnostics,
  analyzeProductionStylingTree,
  checkStylingProductionTree,
  collectProductionStylingSourcePaths,
} from "./styling-guards/production-tree-contract.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const fixturesRoot = path.join(projectRoot, "scripts/styling-guards/fixtures");
const contract = await loadStylingGuardContract();
const manifest = JSON.parse(await readFile(path.join(fixturesRoot, "manifest.json"), "utf8"));

await checkStylingProductionTree(projectRoot);
assert.equal(Object.hasOwn(contract.productionTree, "legacyBaselinePath"), false);
await proveProductionDiscoveryIsNarrowAndExplicit();
await proveCustomPropertyReferencesResolveAcrossTheProject();
await proveEveryProductionRuleRejectsANewOccurrence();

console.log(
  `Styling-produksjonstreets kontrakt er bevist for ${contract.productionTree.enforcedRuleIds.length} regler.`
);

async function proveProductionDiscoveryIsNarrowAndExplicit() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "banebooking-styling-tree-"));
  try {
    await mkdir(path.join(temporaryRoot, "src/generated"), { recursive: true });
    await Promise.all([
      writeFile(path.join(temporaryRoot, "src/base.css"), "@layer base {}\n"),
      writeFile(path.join(temporaryRoot, "src/Screen.svelte"), "<div>Produksjon</div>\n"),
      writeFile(
        path.join(temporaryRoot, "src/Guard.fixture.svelte"),
        "<div>Fixture-navn i produksjon</div>\n"
      ),
      writeFile(
        path.join(temporaryRoot, "src/generated/Generated.svelte"),
        "<div>Generert navn i produksjon</div>\n"
      ),
      writeFile(
        path.join(temporaryRoot, "src/Guard.test.svelte"),
        "<div>Eksplisitt testfixture</div>\n"
      ),
      writeFile(path.join(temporaryRoot, "src/ignored.ts"), "export const ignored = true;\n"),
    ]);

    assert.deepEqual(await collectProductionStylingSourcePaths(temporaryRoot, contract), [
      "src/Guard.fixture.svelte",
      "src/Screen.svelte",
      "src/base.css",
      "src/generated/Generated.svelte",
    ]);
  } finally {
    await rm(temporaryRoot, { recursive: true });
  }
}

async function proveCustomPropertyReferencesResolveAcrossTheProject() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "banebooking-styling-reference-"));
  const tokenPath = path.join(temporaryRoot, "src/styles/design-system/tokens.css");
  const entryPath = path.join(temporaryRoot, "src/index.css");
  try {
    await mkdir(path.dirname(tokenPath), { recursive: true });
    await writeFile(tokenPath, "@layer theme { :root { --app-guard-cross-file: #fff; } }\n");
    await writeFile(
      entryPath,
      "@theme inline { --color-guard-cross-file: var(--app-guard-cross-file); }\n"
    );

    const resolved = await analyzeProductionStylingTree(temporaryRoot, contract);
    assert.deepEqual(resolved.diagnostics, []);

    await writeFile(entryPath, "@theme inline { --color-guard-cross-file: #fff; }\n");
    const unresolved = await analyzeProductionStylingTree(temporaryRoot, contract);
    assert.equal(unresolved.diagnostics.length, 1);
    assert.equal(unresolved.diagnostics[0].ruleId, contract.rules.customProperty.id);
    assert.match(unresolved.diagnostics[0].message, /uten en registrert konsument/);
  } finally {
    await rm(temporaryRoot, { recursive: true });
  }
}

async function proveEveryProductionRuleRejectsANewOccurrence() {
  for (const ruleId of contract.productionTree.enforcedRuleIds) {
    const fixture = manifest.fixtures.find(
      ({ diagnostics, outcome }) =>
        outcome === "rejected" && diagnostics.some((diagnostic) => diagnostic.ruleId === ruleId)
    );
    assert.ok(fixture, `${ruleId} mangler en negativ produksjonsfixture.`);

    const source = await readFile(path.join(fixturesRoot, fixture.fixture), "utf8");
    const newDiagnostics = analyzeStylingSource({
      contract,
      source,
      sourcePath: fixture.sourcePath,
    }).filter((diagnostic) => diagnostic.ruleId === ruleId);
    assert.ok(newDiagnostics.length > 0, `${ruleId} produserte ingen diagnostics.`);
    const [newDiagnostic] = newDiagnostics;
    const expectedLocation = `${fixture.sourcePath}:${newDiagnostic.line}:${newDiagnostic.column} [${ruleId}]`;
    assert.throws(
      () => assertNoProductionStylingDiagnostics([newDiagnostic]),
      (error) => error instanceof Error && error.message.includes(expectedLocation)
    );
  }
}
