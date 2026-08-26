import { readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { analyzeStylingSource } from "./styling-guards/analyze.mjs";
import { loadStylingGuardContract, ruleIds } from "./styling-guards/contract.mjs";

const fixturesRoot = new URL("./styling-guards/fixtures/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", fixturesRoot), "utf8"));
const contract = await loadStylingGuardContract();
const physicalFixtureFiles = await collectFixtureFiles(fixturesRoot);
const failures = [];

validateManifest(manifest, contract, physicalFixtureFiles, failures);

for (const fixture of manifest.fixtures ?? []) {
  const source = await readFile(new URL(fixture.fixture, fixturesRoot), "utf8");
  const actualDiagnostics = normalizeDiagnostics(
    analyzeStylingSource({ contract, source, sourcePath: fixture.sourcePath })
  );
  const expectedDiagnostics = normalizeDiagnostics(fixture.diagnostics ?? []);

  if (!isDeepStrictEqual(actualDiagnostics, expectedDiagnostics)) {
    failures.push(
      [
        `${fixture.id} ga andre diagnostics enn kontrakten forventer.`,
        `Forventet: ${JSON.stringify(expectedDiagnostics)}`,
        `Faktisk: ${JSON.stringify(actualDiagnostics)}`,
      ].join("\n")
    );
  }
}

if (failures.length > 0) {
  throw new Error(`Styling guard-fixturene feilet:\n\n${failures.join("\n\n")}`);
}

console.log(
  `Styling guard-fixtures er intakte: ${manifest.fixtures.length} fixtures, ${ruleIds(contract).length} regler.`
);

function validateManifest(fixtureManifest, guardContract, physicalFiles, validationFailures) {
  if (fixtureManifest?.schemaVersion !== 1) {
    validationFailures.push("Fixturemanifestet må ha schemaVersion 1.");
    return;
  }

  const fixtures = fixtureManifest.fixtures ?? [];
  const ids = fixtures.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) {
    validationFailures.push("Fixturemanifestet har dupliserte fixture-ID-er.");
  }

  const manifestFiles = fixtures.map(({ fixture }) => fixture).sort();
  if (!isDeepStrictEqual(manifestFiles, physicalFiles)) {
    validationFailures.push(
      `Fixturemanifest og filer avviker. Manifest: ${JSON.stringify(manifestFiles)}. Filer: ${JSON.stringify(physicalFiles)}.`
    );
  }

  const knownRuleIds = new Set(ruleIds(guardContract));
  for (const fixture of fixtures) {
    if (!["allowed", "rejected"].includes(fixture.outcome)) {
      validationFailures.push(`${fixture.id} har ukjent outcome «${fixture.outcome}».`);
    }
    if (!Array.isArray(fixture.coversRules) || fixture.coversRules.length === 0) {
      validationFailures.push(`${fixture.id} mangler coversRules.`);
    }
    for (const ruleId of fixture.coversRules ?? []) {
      if (!knownRuleIds.has(ruleId)) {
        validationFailures.push(`${fixture.id} dekker ukjent regel ${ruleId}.`);
      }
    }
    for (const expected of fixture.diagnostics ?? []) {
      if (!knownRuleIds.has(expected.ruleId)) {
        validationFailures.push(`${fixture.id} forventer ukjent regel ${expected.ruleId}.`);
      }
      if (!(fixture.coversRules ?? []).includes(expected.ruleId)) {
        validationFailures.push(
          `${fixture.id} forventer ${expected.ruleId} uten å registrere regelen i coversRules.`
        );
      }
      if (!expected.message) {
        validationFailures.push(`${fixture.id} mangler forventet diagnostictekst.`);
      }
    }
    if (fixture.outcome === "allowed" && (fixture.diagnostics ?? []).length > 0) {
      validationFailures.push(`${fixture.id} er allowed, men forventer diagnostics.`);
    }
    if (fixture.outcome === "rejected" && (fixture.diagnostics ?? []).length === 0) {
      validationFailures.push(`${fixture.id} er rejected uten forventet diagnostic.`);
    }
  }

  for (const ruleId of knownRuleIds) {
    const hasAllowedFixture = fixtures.some(
      ({ coversRules, outcome }) => outcome === "allowed" && coversRules.includes(ruleId)
    );
    const hasRejectedFixture = fixtures.some(
      ({ diagnostics, outcome }) =>
        outcome === "rejected" && diagnostics.some((entry) => entry.ruleId === ruleId)
    );
    if (!hasAllowedFixture || !hasRejectedFixture) {
      validationFailures.push(
        `${ruleId} må ha minst én positiv og én negativ fixture (guardkrav 10).`
      );
    }
  }
}

async function collectFixtureFiles(directoryUrl, prefix = "") {
  const entries = (await readdir(directoryUrl, { withFileTypes: true })).sort((left, right) =>
    left.name.localeCompare(right.name)
  );
  const files = [];

  for (const entry of entries) {
    const relativePath = `${prefix}${entry.name}`;
    if (entry.isDirectory()) {
      files.push(
        ...(await collectFixtureFiles(new URL(`${entry.name}/`, directoryUrl), `${relativePath}/`))
      );
    } else if (/\.(?:css|svelte)$/.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

function normalizeDiagnostics(diagnostics) {
  return diagnostics
    .map(({ message, ruleId }) => ({ message, ruleId }))
    .sort(
      (left, right) =>
        left.ruleId.localeCompare(right.ruleId) || left.message.localeCompare(right.message)
    );
}
