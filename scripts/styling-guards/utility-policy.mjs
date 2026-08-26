export function analyzeClassAttribute({ attribute, contract, source }) {
  const location = offsetLocation(source, attribute.start ?? 0);
  const classValues = resolveClassAttribute(attribute);

  if (classValues === null) {
    return [
      diagnostic(
        contract.rules.staticClassSet.id,
        "dynamisk class må kunne løses til et endelig sett med hele klassenavn",
        location
      ),
    ];
  }

  return classValues.flatMap((value) =>
    value
      .split(/\s+/)
      .filter(Boolean)
      .flatMap((className) => analyzeUtilityClass(className, contract, location))
  );
}

export function analyzeClassDirective({ attribute, contract, source }) {
  return analyzeUtilityClass(
    attribute.name,
    contract,
    offsetLocation(source, attribute.start ?? 0)
  );
}

export function staticAttributeValue(attribute) {
  if (!Array.isArray(attribute.value)) return null;
  if (!attribute.value.every((part) => part.type === "Text")) return null;
  return attribute.value.map((part) => part.data).join("");
}

function resolveClassAttribute(attribute) {
  const staticValue = staticAttributeValue(attribute);
  if (staticValue !== null) return [staticValue];

  if (attribute.value?.type !== "ExpressionTag") return null;
  return resolveClassExpression(attribute.value.expression);
}

function resolveClassExpression(expression) {
  if (!expression) return null;

  if (expression.type === "Literal") {
    if (typeof expression.value === "string") return [expression.value];
    if (expression.value === null || typeof expression.value === "boolean") return [""];
    return null;
  }

  if (expression.type === "TemplateLiteral") {
    if (expression.expressions.length > 0) return null;
    return [expression.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("")];
  }

  if (expression.type === "ConditionalExpression") {
    return mergeResolved(
      resolveClassExpression(expression.consequent),
      resolveClassExpression(expression.alternate)
    );
  }

  if (expression.type === "LogicalExpression") {
    if (expression.operator === "&&") {
      return mergeResolved([""], resolveClassExpression(expression.right));
    }
    return mergeResolved(
      resolveClassExpression(expression.left),
      resolveClassExpression(expression.right)
    );
  }

  if (expression.type === "ArrayExpression") {
    const resolvedElements = expression.elements.map((element) =>
      element ? resolveClassExpression(element) : [""]
    );
    if (resolvedElements.some((values) => values === null)) return null;
    return combineResolved(resolvedElements);
  }

  if (expression.type === "ObjectExpression") {
    const keys = [];
    for (const property of expression.properties) {
      if (property.type !== "Property" || property.computed) return null;
      if (property.key.type === "Identifier") keys.push(property.key.name);
      else if (property.key.type === "Literal" && typeof property.key.value === "string") {
        keys.push(property.key.value);
      } else {
        return null;
      }
    }
    return keys;
  }

  return null;
}

function mergeResolved(left, right) {
  if (left === null || right === null) return null;
  return [...new Set([...left, ...right])];
}

function combineResolved(groups) {
  let combinations = [""];
  for (const group of groups) {
    combinations = combinations.flatMap((prefix) =>
      group.map((value) => [prefix, value].filter(Boolean).join(" "))
    );
  }
  return [...new Set(combinations)];
}

function analyzeUtilityClass(className, contract, location) {
  const { base, variants } = splitVariants(className);
  const utilityRule = contract.rules.utilityVocabulary.id;

  if (variants.includes("dark")) {
    return [
      diagnostic(
        utilityRule,
        `dark:-varianten er ikke tillatt; bruk semantiske theme-roller i «${className}»`,
        location
      ),
    ];
  }

  const unknownVariant = variants.find((variant) => !isAllowedVariant(variant, contract));
  if (unknownVariant) {
    return [
      diagnostic(
        utilityRule,
        `varianten «${unknownVariant}» er ikke registrert for «${className}»`,
        location
      ),
    ];
  }

  if (base.startsWith("!") || base.endsWith("!")) {
    return [
      diagnostic(utilityRule, `important-modifier er ikke tillatt i «${className}»`, location),
    ];
  }

  const normalizedBase = base.replace(/^-/, "");
  if (normalizedBase.includes("[") || normalizedBase.includes("]")) {
    return [
      diagnostic(utilityRule, `arbitrary utilityverdi er ikke tillatt i «${className}»`, location),
    ];
  }

  if (new RegExp(contract.utilities.forbiddenRawPalettePattern).test(normalizedBase)) {
    return [diagnostic(utilityRule, `rå palettutility er ikke tillatt i «${className}»`, location)];
  }

  if (isNeutralStructureUtility(normalizedBase, contract)) return [];

  const semanticMatch = matchSemanticVisualUtility(normalizedBase, contract);
  if (semanticMatch?.allowed) return [];
  if (semanticMatch) {
    return [
      diagnostic(
        contract.rules.themeRole.id,
        `«${className}» bruker theme-rollen «${semanticMatch.role}», som ikke finnes i kontrakten`,
        location
      ),
    ];
  }

  return [
    diagnostic(
      utilityRule,
      `utility «${className}» finnes ikke i struktur- eller produktvokabularet`,
      location
    ),
  ];
}

function splitVariants(className) {
  const parts = [];
  let bracketDepth = 0;
  let current = "";

  for (const character of className) {
    if (character === "[") bracketDepth += 1;
    if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    if (character === ":" && bracketDepth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  parts.push(current);

  return { base: parts.at(-1) ?? "", variants: parts.slice(0, -1) };
}

function isAllowedVariant(variant, contract) {
  const allowed = contract.utilities.allowedVariants;
  if (allowed.exact.includes(variant)) return true;
  return allowed.patterns.some((pattern) => new RegExp(pattern).test(variant));
}

function isNeutralStructureUtility(className, contract) {
  const vocabulary = contract.utilities.identityNeutralStructure;
  if (vocabulary.exact.includes(className)) return true;
  return vocabulary.patterns.some((pattern) => new RegExp(pattern).test(className));
}

function matchSemanticVisualUtility(className, contract) {
  const withoutOpacity = className.replace(/\/[0-9]+$/, "");
  const families = contract.utilities.semanticVisualFamilies.flatMap((family) =>
    family.utilityPrefixes.map((prefix) => ({ ...family, prefix }))
  );
  const matchingFamilies = families.filter((family) =>
    withoutOpacity.startsWith(`${family.prefix}-`)
  );
  if (matchingFamilies.length === 0) return null;

  const longestPrefixLength = Math.max(...matchingFamilies.map(({ prefix }) => prefix.length));
  const exactPrefixFamilies = matchingFamilies.filter(
    ({ prefix }) => prefix.length === longestPrefixLength
  );
  const role = withoutOpacity.slice(exactPrefixFamilies[0].prefix.length + 1);
  return {
    allowed: exactPrefixFamilies.some((family) => family.roles.includes(role)),
    role,
  };
}

function diagnostic(ruleId, message, location) {
  return { ...location, message, ruleId };
}

function offsetLocation(source, offset) {
  const before = source.slice(0, Math.max(offset, 0));
  const lastNewline = before.lastIndexOf("\n");
  return {
    column: before.length - lastNewline,
    line: (before.match(/\n/g)?.length ?? 0) + 1,
  };
}
