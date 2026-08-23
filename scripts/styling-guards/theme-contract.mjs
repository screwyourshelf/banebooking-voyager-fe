import { readFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import { compile } from "tailwindcss";
import { loadStylingGuardContract, semanticUtilityEntries } from "./contract.mjs";

export async function checkStylingThemeContract(projectRoot) {
  const contract = await loadStylingGuardContract();
  const entryPath = path.join(projectRoot, contract.theme.entryStylesheet);
  const tokenPath = path.join(projectRoot, contract.theme.tokenStylesheet);
  const [entrySource, tokenSource] = await Promise.all([
    readFile(entryPath, "utf8"),
    readFile(tokenPath, "utf8"),
  ]);
  const failures = [];
  const expectedThemeDeclarations = expectedThemeDeclarationMap(contract);
  const themeRule = readInlineThemeRule(entrySource, contract.theme.entryStylesheet, failures);

  if (themeRule) {
    validateThemeDeclarations(themeRule, expectedThemeDeclarations, failures);
  }

  const { dark, light } = readProductThemeValues(
    tokenSource,
    contract.theme.tokenStylesheet,
    failures
  );
  let darkChangedRoleCount = 0;
  for (const [themeVariable, sourceCustomProperty] of expectedThemeDeclarations) {
    const lightValue = resolveCustomProperty(light, sourceCustomProperty, failures, "light");
    const darkValue = resolveCustomProperty(dark, sourceCustomProperty, failures, "dark");
    if (lightValue !== null && darkValue !== null && lightValue !== darkValue) {
      darkChangedRoleCount += 1;
    }

    if (themeRule) {
      const declaration = themeRule.nodes.find(
        (node) => node.type === "decl" && node.prop === themeVariable
      );
      if (declaration?.value !== `var(${sourceCustomProperty})`) {
        failures.push(
          `${themeVariable} skal mappe direkte til ${sourceCustomProperty}, fant ${declaration?.value ?? "ingen deklarasjon"}.`
        );
      }
    }
  }

  const semanticUtilities = semanticUtilityEntries(contract);
  if (themeRule) {
    await validateTailwindUtilities(themeRule, semanticUtilities, failures);
  }

  if (darkChangedRoleCount === 0) {
    failures.push("Ingen eksponert theme-rolle endrer verdi mellom lyst og mørkt theme.");
  }
  if (failures.length > 0) {
    throw new Error(`Styling theme-kontrakten feilet:\n\n${failures.join("\n\n")}`);
  }

  return {
    darkChangedRoleCount,
    semanticUtilityCount: semanticUtilities.length,
    themeRoleCount: expectedThemeDeclarations.size,
  };
}

function expectedThemeDeclarationMap(contract) {
  const declarations = new Map();
  for (const namespace of Object.values(contract.theme.namespaces)) {
    for (const [role, sourceCustomProperty] of Object.entries(namespace.roles)) {
      declarations.set(`${namespace.themeVariablePrefix}${role}`, sourceCustomProperty);
    }
  }
  return new Map([...declarations.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function readInlineThemeRule(source, sourcePath, failures) {
  const root = postcss.parse(source, { from: sourcePath });
  const themeRules = [];
  root.walkAtRules("theme", (rule) => themeRules.push(rule));
  if (themeRules.length !== 1 || themeRules[0].params.trim() !== "inline") {
    failures.push(
      `${sourcePath} skal inneholde nøyaktig én @theme inline-blokk; fant ${themeRules.length}.`
    );
    return null;
  }
  return themeRules[0];
}

function validateThemeDeclarations(themeRule, expectedDeclarations, failures) {
  const actualDeclarations = new Map();
  for (const node of themeRule.nodes ?? []) {
    if (node.type !== "decl") continue;
    if (actualDeclarations.has(node.prop)) {
      failures.push(`@theme inline definerer ${node.prop} mer enn én gang.`);
    }
    actualDeclarations.set(node.prop, node.value);
  }

  for (const [themeVariable, sourceCustomProperty] of expectedDeclarations) {
    if (!actualDeclarations.has(themeVariable)) {
      failures.push(`@theme inline mangler ${themeVariable}: var(${sourceCustomProperty}).`);
    }
  }
  for (const themeVariable of actualDeclarations.keys()) {
    if (!expectedDeclarations.has(themeVariable)) {
      failures.push(`@theme inline eksponerer uregistrert rolle ${themeVariable}.`);
    }
  }
}

function readProductThemeValues(source, sourcePath, failures) {
  const root = postcss.parse(source, { from: sourcePath });
  const light = declarationsForTopLevelSelector(root, ":root");
  const darkOverrides = declarationsForTopLevelSelector(root, ".dark");
  if (light.size === 0) failures.push(`${sourcePath} mangler top-level :root theme.`);
  if (darkOverrides.size === 0) failures.push(`${sourcePath} mangler top-level .dark theme.`);
  return { dark: new Map([...light, ...darkOverrides]), light };
}

function declarationsForTopLevelSelector(root, selector) {
  const declarations = new Map();
  for (const node of root.nodes) {
    if (node.type !== "rule" || node.selector.trim() !== selector) continue;
    for (const child of node.nodes ?? []) {
      if (child.type === "decl" && child.prop.startsWith("--")) {
        declarations.set(child.prop, child.value);
      }
    }
  }
  return declarations;
}

function resolveCustomProperty(values, name, failures, theme, stack = []) {
  if (stack.includes(name)) {
    failures.push(
      `${theme} theme har sirkulær custom-property-kjede: ${[...stack, name].join(" -> ")}.`
    );
    return null;
  }
  const value = values.get(name);
  if (value === undefined) {
    failures.push(`${name} er ikke definert for ${theme} theme.`);
    return null;
  }

  let unresolved = false;
  const resolved = value.replace(/var\((--[a-zA-Z0-9_-]+)\)/g, (_match, dependency) => {
    const dependencyValue = resolveCustomProperty(values, dependency, failures, theme, [
      ...stack,
      name,
    ]);
    if (dependencyValue === null) {
      unresolved = true;
      return `var(${dependency})`;
    }
    return dependencyValue;
  });
  if (unresolved || resolved.includes("var(")) {
    if (!unresolved) {
      failures.push(`${name} kan ikke løses fullstendig for ${theme} theme: ${resolved}.`);
    }
    return null;
  }
  return resolved;
}

async function validateTailwindUtilities(themeRule, semanticUtilities, failures) {
  const compiler = await compile(`${themeRule.toString()}\n@tailwind utilities;`);
  const generatedRoot = postcss.parse(
    compiler.build(semanticUtilities.map(({ className }) => className))
  );

  for (const { className, sourceCustomProperty } of semanticUtilities) {
    const selectorNeedle = `.${className}`;
    const generatedRules = [];
    generatedRoot.walkRules((rule) => {
      if (rule.selector.includes(selectorNeedle)) generatedRules.push(rule);
    });
    if (generatedRules.length === 0) {
      failures.push(`Tailwind genererte ikke den godkjente utilityen ${className}.`);
      continue;
    }
    if (!generatedRules.some((rule) => rule.toString().includes(`var(${sourceCustomProperty})`))) {
      failures.push(
        `${className} bruker ikke den registrerte produktrollen ${sourceCustomProperty}.`
      );
    }
  }
}
