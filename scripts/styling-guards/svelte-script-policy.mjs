import {
  memberPath,
  offsetLocation,
  rootIdentifier,
  staticMemberName,
  staticStringValue,
  unwrapExpression,
  walkAst,
} from "./svelte-ast.mjs";

export function analyzeImperativeDomStyling({
  ast,
  contract,
  isFeatureOrRoute,
  isVisualization,
  source,
}) {
  const diagnostics = [];
  const ruleId = isVisualization
    ? contract.rules.visualizationException.id
    : isFeatureOrRoute
      ? contract.rules.featureStyling.id
      : contract.rules.cssApplication.id;

  for (const script of [ast.module?.content, ast.instance?.content].filter(Boolean)) {
    const styleObjectAliases = collectStyleObjectAliases(script, contract);
    walkAst(script, (node) => {
      const sink = imperativeDomStylingSink(node, contract, styleObjectAliases);
      if (!sink) return;
      diagnostics.push({
        ...offsetLocation(source, node.start ?? 0),
        message: `imperativ DOM-styling gjennom ${sink} er forbudt; bruk offentlig UI, theme og statiske utilities`,
        ruleId,
      });
    });
  }

  return diagnostics;
}

function imperativeDomStylingSink(node, contract, styleObjectAliases) {
  if (
    node.type === "AssignmentExpression" &&
    isDomStylingTarget(node.left, contract, styleObjectAliases)
  ) {
    return memberPath(node.left).join(".") || "style-assignment";
  }
  if (
    node.type === "UpdateExpression" &&
    isDomStylingTarget(node.argument, contract, styleObjectAliases)
  ) {
    return memberPath(node.argument).join(".") || "style-update";
  }
  if (
    node.type === "UnaryExpression" &&
    node.operator === "delete" &&
    isDomStylingTarget(node.argument, contract, styleObjectAliases)
  ) {
    return memberPath(node.argument).join(".") || "style-delete";
  }
  if (node.type !== "CallExpression") return null;

  const callee = unwrapExpression(node.callee);
  if (callee?.type !== "MemberExpression") return null;
  const methodName = staticMemberName(callee);
  const objectPath = memberPath(callee.object);
  const objectKind = styleObjectKind(callee.object, contract, styleObjectAliases);

  if (contract.svelteScript.cssStyleMutationMethods.includes(methodName)) return methodName;
  if (
    (objectPath.includes("classList") || objectKind === "classList") &&
    contract.svelteScript.classListMutationMethods.includes(methodName)
  ) {
    return `classList.${methodName}`;
  }

  const attributeArgumentIndex = methodName?.endsWith("AttributeNS") ? 1 : 0;
  if (contract.svelteScript.attributeMutationMethods.includes(methodName)) {
    const attributeName = staticStringValue(node.arguments[attributeArgumentIndex]);
    if (attributeName === null) return `${methodName}(dynamisk attributt)`;
    if (imperativeStylingAttributeNames(contract).has(attributeName.toLowerCase())) {
      return `${methodName}("${attributeName}")`;
    }
  }
  if (contract.svelteScript.opaqueAttributeMutationMethods.includes(methodName)) {
    return methodName;
  }

  if (
    callee.object?.type === "Identifier" &&
    callee.object.name === "Object" &&
    methodName === "assign" &&
    isStyleObjectExpression(node.arguments[0], contract, styleObjectAliases)
  ) {
    return "Object.assign(style)";
  }
  if (
    node.arguments.some((argument) =>
      isStyleObjectExpression(argument, contract, styleObjectAliases)
    )
  ) {
    return "style-object argument";
  }

  return null;
}

function imperativeStylingAttributeNames(contract) {
  return new Set([
    "class",
    "style",
    "data-series",
    "data-stat-role",
    "data-visualization",
    ...contract.publicUiForwarding.forbiddenPropNames,
    ...contract.visualizationException.svgGeometryAttributeVocabulary.map((name) =>
      name.toLowerCase()
    ),
    ...contract.visualizationException.svgPresentationAttributes.map((name) => name.toLowerCase()),
  ]);
}

function collectStyleObjectAliases(root, contract) {
  const aliases = new Map();
  let changed = true;

  while (changed) {
    changed = false;
    walkAst(root, (node) => {
      if (
        node.type !== "VariableDeclarator" ||
        node.id?.type !== "Identifier" ||
        aliases.has(node.id.name)
      ) {
        return;
      }
      const kind = styleObjectKind(node.init, contract, aliases);
      if (!kind) return;
      aliases.set(node.id.name, kind);
      changed = true;
    });
  }

  return aliases;
}

function isDomStylingTarget(node, contract, styleObjectAliases) {
  const path = memberPath(node);
  return (
    styleObjectKind(node, contract, styleObjectAliases) !== null ||
    contract.svelteScript.styleAssignmentMembers.includes(path.at(-1))
  );
}

function isStyleObjectExpression(node, contract, styleObjectAliases) {
  return styleObjectKind(node, contract, styleObjectAliases) !== null;
}

function styleObjectKind(node, contract, styleObjectAliases = new Map()) {
  const path = memberPath(node);
  const matchedMember = contract.svelteScript.styleObjectMembers.find((member) =>
    path.includes(member)
  );
  if (matchedMember) return matchedMember;
  const identifier = rootIdentifier(node);
  return identifier ? (styleObjectAliases.get(identifier) ?? null) : null;
}
