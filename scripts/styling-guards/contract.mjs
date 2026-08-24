import { readFile } from "node:fs/promises";

const contractUrl = new URL("./contract.json", import.meta.url);

export async function loadStylingGuardContract(url = contractUrl) {
  const contract = JSON.parse(await readFile(url, "utf8"));
  validateStylingGuardContract(contract);
  return contract;
}

export function validateStylingGuardContract(contract) {
  if (contract?.schemaVersion !== 2) {
    throw new Error("Styling guard-kontrakten må ha schemaVersion 2.");
  }
  if (
    contract.analyzerEnforcementPhase !== "fixtures-only" ||
    contract.cascadeContractEnforcementPhase !== "active" ||
    contract.themeContractEnforcementPhase !== "active" ||
    contract.productionTreeEnforcementCheckpoint !== "SWP-1.3"
  ) {
    throw new Error("Styling guard-kontrakten har uventet SWP-1 enforcementfase.");
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

  validateThemeVocabulary(contract);
  validateCssCascadeContract(contract);
}

function validateCssCascadeContract(contract) {
  if (contract.css?.allowedLayers?.join(",") !== "theme,base,components,utilities") {
    throw new Error(
      "Cascade-kontrakten må bruke Tailwinds theme-, base-, components- og utilities-lag."
    );
  }

  const stylesheets = contract.css?.productionStylesheets ?? [];
  const sortedStylesheets = [...stylesheets].sort((left, right) => left.localeCompare(right));
  if (
    stylesheets.length === 0 ||
    new Set(stylesheets).size !== stylesheets.length ||
    stylesheets.some((stylesheet) => !/^src\/.+\.css$/.test(stylesheet)) ||
    stylesheets.some((stylesheet, index) => stylesheet !== sortedStylesheets[index])
  ) {
    throw new Error(
      "Cascade-kontraktens produksjons-CSS må være en unik, sortert src/**/*.css-liste."
    );
  }

  for (const requiredStylesheet of [
    contract.theme.entryStylesheet,
    contract.theme.tokenStylesheet,
  ]) {
    if (!stylesheets.includes(requiredStylesheet)) {
      throw new Error(`Cascade-kontrakten mangler ${requiredStylesheet}.`);
    }
  }
}

function validateThemeVocabulary(contract) {
  const namespaces = contract.theme?.namespaces ?? {};
  const namespaceEntries = Object.entries(namespaces);
  if (namespaceEntries.length === 0) {
    throw new Error("Styling guard-kontrakten mangler Tailwind theme namespaces.");
  }

  const productThemeNamespace = contract.customProperties?.namespaces?.find(
    ({ name }) => name === "product-theme"
  );
  if (!productThemeNamespace) {
    throw new Error("Styling guard-kontrakten mangler product-theme custom-property-eieren.");
  }

  const registeredThemeRoles = new Set();
  const registeredThemeVariables = new Set();
  for (const [namespaceName, namespace] of namespaceEntries) {
    if (!/^--[a-z][a-z0-9-]*-$/.test(namespace.themeVariablePrefix ?? "")) {
      throw new Error(`Theme namespace «${namespaceName}» har ugyldig variabelprefix.`);
    }

    const roles = Object.entries(namespace.roles ?? {});
    if (roles.length === 0) {
      throw new Error(`Theme namespace «${namespaceName}» mangler roller.`);
    }
    for (const [role, sourceCustomProperty] of roles) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(role)) {
        throw new Error(`Theme namespace «${namespaceName}» har ugyldig rolle «${role}».`);
      }
      if (!/^--[a-z][a-z0-9-]*$/.test(sourceCustomProperty)) {
        throw new Error(`Theme-rollen «${namespaceName}.${role}» har ugyldig produktvariabel.`);
      }
      if (sourceCustomProperty.startsWith("--aas-")) {
        throw new Error(
          `Theme-rollen «${namespaceName}.${role}» eksponerer rå klubbidentitet direkte.`
        );
      }
      if (!customPropertyBelongsToNamespace(sourceCustomProperty, productThemeNamespace)) {
        throw new Error(
          `Theme-rollen «${namespaceName}.${role}» peker utenfor product-theme-kontrakten.`
        );
      }
      registeredThemeRoles.add(`${namespaceName}.${role}`);
      const themeVariable = `${namespace.themeVariablePrefix}${role}`;
      if (registeredThemeVariables.has(themeVariable)) {
        throw new Error(`Tailwind theme-variabelen «${themeVariable}» er registrert flere ganger.`);
      }
      registeredThemeVariables.add(themeVariable);
    }
  }

  const usedThemeRoles = new Set();
  const semanticUtilities = new Set();
  for (const family of contract.utilities?.semanticVisualFamilies ?? []) {
    const namespace = namespaces[family.themeNamespace];
    if (!namespace) {
      throw new Error(
        `Utilityfamilien ${JSON.stringify(family.utilityPrefixes)} peker på ukjent theme namespace «${String(family.themeNamespace)}».`
      );
    }
    if (!Array.isArray(family.utilityPrefixes) || family.utilityPrefixes.length === 0) {
      throw new Error("En semantisk utilityfamilie mangler utilityPrefixes.");
    }
    if (!Array.isArray(family.roles) || family.roles.length === 0) {
      throw new Error("En semantisk utilityfamilie mangler roller.");
    }

    for (const role of family.roles) {
      const themeRole = `${family.themeNamespace}.${role}`;
      if (!registeredThemeRoles.has(themeRole)) {
        throw new Error(
          `Utilityfamilien ${JSON.stringify(family.utilityPrefixes)} peker på ukjent theme-rolle «${themeRole}».`
        );
      }
      usedThemeRoles.add(themeRole);

      for (const prefix of family.utilityPrefixes) {
        const utility = `${prefix}-${role}`;
        if (semanticUtilities.has(utility)) {
          throw new Error(`Semantisk utility «${utility}» er registrert mer enn én gang.`);
        }
        semanticUtilities.add(utility);
      }
    }
  }

  for (const themeRole of registeredThemeRoles) {
    if (!usedThemeRoles.has(themeRole)) {
      throw new Error(`Theme-rollen «${themeRole}» har ingen godkjent utilitykonsument.`);
    }
  }
}

function customPropertyBelongsToNamespace(name, namespace) {
  return (
    namespace.exact.includes(name) || namespace.prefixes.some((prefix) => name.startsWith(prefix))
  );
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

export function semanticUtilityEntries(contract) {
  return contract.utilities.semanticVisualFamilies
    .flatMap((family) => {
      const namespace = contract.theme.namespaces[family.themeNamespace];
      return family.utilityPrefixes.flatMap((utilityPrefix) =>
        family.roles.map((role) => ({
          className: `${utilityPrefix}-${role}`,
          role,
          sourceCustomProperty: namespace.roles[role],
          themeNamespace: family.themeNamespace,
          themeVariable: `${namespace.themeVariablePrefix}${role}`,
          utilityPrefix,
        }))
      );
    })
    .sort((left, right) => left.className.localeCompare(right.className));
}
