import { readFile } from "node:fs/promises";

const contractUrl = new URL("./contract.json", import.meta.url);

export async function loadStylingGuardContract(url = contractUrl) {
  const contract = JSON.parse(await readFile(url, "utf8"));
  validateStylingGuardContract(contract);
  return contract;
}

export function validateStylingGuardContract(contract) {
  if (contract?.schemaVersion !== 1) {
    throw new Error("Styling guard-kontrakten må ha schemaVersion 1.");
  }

  const ruleEntries = Object.entries(contract.rules ?? {});
  if (ruleEntries.length !== 10) {
    throw new Error("Styling guard-kontrakten skal ha nøyaktig ti stabile regler.");
  }

  const ruleIds = ruleEntries.map(([, rule]) => rule.id);
  if (new Set(ruleIds).size !== ruleIds.length) {
    throw new Error("Styling guard-kontrakten har dupliserte regel-ID-er.");
  }
  for (const ruleId of ruleIds) {
    if (!/^STYLING-\d{3}-[A-Z0-9-]+$/.test(ruleId)) {
      throw new Error(`Ugyldig stylingregel-ID: ${String(ruleId)}`);
    }
  }

  const requirements = contract.planRequirements ?? [];
  const requirementNumbers = requirements.map(({ number }) => number);
  if (requirementNumbers.join(",") !== "1,2,3,4,5,6,7,8,9,10") {
    throw new Error("Stylingplanens guardkrav 1–10 må være eksplisitt kartlagt.");
  }

  const ruleKeys = new Set(ruleEntries.map(([key]) => key));
  for (const requirement of requirements.filter(({ number }) => number < 10)) {
    if (!Array.isArray(requirement.ruleKeys) || requirement.ruleKeys.length === 0) {
      throw new Error(`Guardkrav ${requirement.number} mangler regelkartlegging.`);
    }
    for (const ruleKey of requirement.ruleKeys) {
      if (!ruleKeys.has(ruleKey)) {
        throw new Error(`Guardkrav ${requirement.number} peker på ukjent regel «${ruleKey}».`);
      }
    }
  }

  if (!requirements.find(({ number }) => number === 10)?.fixtureInvariant) {
    throw new Error("Guardkrav 10 må definere fixtureintegritetsinvarianten.");
  }
}

export function pathMatchesRoot(repositoryPath, root) {
  return root.endsWith("/") ? repositoryPath.startsWith(root) : repositoryPath === root;
}

export function pathMatchesAnyRoot(repositoryPath, roots) {
  return roots.some((root) => pathMatchesRoot(repositoryPath, root));
}

export function ruleIds(contract) {
  return Object.values(contract.rules).map(({ id }) => id);
}
