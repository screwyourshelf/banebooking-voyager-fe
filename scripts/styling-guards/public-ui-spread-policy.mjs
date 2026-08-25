import { rootIdentifier, staticPropertyName, unwrapExpression, walkAst } from "./svelte-ast.mjs";

export function collectPublicUiSpreadProof(ast, importNodes, contract) {
  const expressionBindings = new Map();
  const safeIdentifiers = new Set();
  const writtenIdentifiers = new Set();
  const bindingCounts = new Map();
  const publicHtmlAttributeTypeNames = new Set();
  const typeAliases = new Map();

  for (const importNode of importNodes) {
    if (!importNode.source.value.endsWith("/public-html-attributes")) continue;
    for (const specifier of importNode.specifiers) {
      if (
        specifier.type === "ImportSpecifier" &&
        specifier.imported?.name === contract.publicUiForwarding.attributeType
      ) {
        publicHtmlAttributeTypeNames.add(specifier.local.name);
      }
    }
  }

  // A typed or sanitized rest object remains proof only while its binding is unique and does not
  // escape into code that the static analyzer cannot inspect.
  walkAst(ast, (node) => {
    if (node.type === "TSTypeAliasDeclaration" && node.id?.name) {
      typeAliases.set(node.id.name, node.typeAnnotation);
    }
    for (const pattern of bindingPatterns(node)) {
      for (const name of patternIdentifierNames(pattern)) {
        bindingCounts.set(name, (bindingCounts.get(name) ?? 0) + 1);
      }
    }
  });

  walkAst(ast, (node) => {
    if (node.type !== "VariableDeclarator") return;

    if (node.id?.type === "Identifier" && node.init) {
      const bindings = expressionBindings.get(node.id.name) ?? [];
      bindings.push(node.init);
      expressionBindings.set(node.id.name, bindings);
      return;
    }
    if (node.id?.type !== "ObjectPattern") return;

    const omittedNames = [];
    for (const property of node.id.properties) {
      if (property.type === "Property" && !property.computed) {
        const propertyName = staticPropertyName(property.key);
        if (propertyName) omittedNames.push(propertyName.toLowerCase());
        continue;
      }
      if (property.type !== "RestElement" || property.argument?.type !== "Identifier") continue;

      const omitsStyling = contract.publicUiForwarding.forbiddenPropNames.every((name) =>
        omittedNames.includes(name)
      );
      const typeProof = publicHtmlAttributeTypeProof(
        node.id.typeAnnotation?.typeAnnotation,
        publicHtmlAttributeTypeNames,
        typeAliases,
        contract.publicUiForwarding.typePreservingWrappers
      );
      const hasPublicHtmlAttributeType =
        isPropsCall(node.init) && typeProof.proven && typeProof.rooted;
      if (omitsStyling || hasPublicHtmlAttributeType) {
        safeIdentifiers.add(property.argument.name);
      }
    }
  });

  walkAst(ast, (node) => {
    if (node.type === "AssignmentExpression" || node.type === "UpdateExpression") {
      const identifier = rootIdentifier(
        node.type === "AssignmentExpression" ? node.left : node.argument
      );
      if (identifier) writtenIdentifiers.add(identifier);
    }
    if (node.type === "UnaryExpression" && node.operator === "delete") {
      const identifier = rootIdentifier(node.argument);
      if (identifier) writtenIdentifiers.add(identifier);
    }
    if (node.type === "CallExpression") {
      for (const argument of node.arguments) {
        const identifier = rootIdentifier(argument);
        if (identifier && safeIdentifiers.has(identifier)) writtenIdentifiers.add(identifier);
      }
    }
    if (node.type === "VariableDeclarator") {
      const initializer = unwrapExpression(node.init);
      if (initializer?.type === "Identifier" && safeIdentifiers.has(initializer.name)) {
        writtenIdentifiers.add(initializer.name);
      }
    }
    if (node.type === "AssignmentExpression") {
      const assignedValue = unwrapExpression(node.right);
      if (assignedValue?.type === "Identifier" && safeIdentifiers.has(assignedValue.name)) {
        writtenIdentifiers.add(assignedValue.name);
      }
    }
    if (node.type === "ReturnStatement") {
      const returnedValue = unwrapExpression(node.argument);
      if (returnedValue?.type === "Identifier" && safeIdentifiers.has(returnedValue.name)) {
        writtenIdentifiers.add(returnedValue.name);
      }
    }
  });

  for (const identifier of safeIdentifiers) {
    if (bindingCounts.get(identifier) !== 1) writtenIdentifiers.add(identifier);
  }
  writtenIdentifiers.forEach((identifier) => safeIdentifiers.delete(identifier));

  return {
    expressionBindings,
    forbiddenPropNames: contract.publicUiForwarding.forbiddenPropNames,
    safeIdentifiers,
  };
}

export function resolvePublicUiSpreadStyling(expression, proof, seenIdentifiers = new Set()) {
  const candidate = unwrapExpression(expression);
  if (!candidate || typeof candidate !== "object") {
    return { resolved: false, stylingNames: [] };
  }

  if (candidate.type === "Identifier") {
    if (proof.safeIdentifiers.has(candidate.name)) {
      return { resolved: true, stylingNames: [] };
    }
    if (seenIdentifiers.has(candidate.name)) {
      return { resolved: false, stylingNames: [] };
    }
    const bindings = proof.expressionBindings.get(candidate.name) ?? [];
    if (bindings.length !== 1) return { resolved: false, stylingNames: [] };
    const bindingProof = resolvePublicUiSpreadStyling(
      bindings[0],
      proof,
      new Set([...seenIdentifiers, candidate.name])
    );
    return bindingProof.stylingNames.length > 0
      ? bindingProof
      : { resolved: false, stylingNames: [] };
  }

  if (candidate.type === "ObjectExpression") {
    const stylingNames = new Set();
    let resolved = true;

    for (const property of candidate.properties) {
      if (property.type === "SpreadElement") {
        const nested = resolvePublicUiSpreadStyling(property.argument, proof, seenIdentifiers);
        nested.stylingNames.forEach((name) => stylingNames.add(name));
        resolved &&= nested.resolved;
        continue;
      }
      if (property.type !== "Property") {
        resolved = false;
        continue;
      }

      const name = staticPropertyName(property.key)?.toLowerCase();
      if (property.computed && name === undefined) resolved = false;
      if (proof.forbiddenPropNames.includes(name)) stylingNames.add(name);
    }

    return { resolved, stylingNames: [...stylingNames].sort() };
  }

  if (candidate.type === "ConditionalExpression") {
    return mergeSpreadProofs([
      resolvePublicUiSpreadStyling(candidate.consequent, proof, seenIdentifiers),
      resolvePublicUiSpreadStyling(candidate.alternate, proof, seenIdentifiers),
    ]);
  }
  if (candidate.type === "SequenceExpression" && candidate.expressions.length > 0) {
    return resolvePublicUiSpreadStyling(candidate.expressions.at(-1), proof, seenIdentifiers);
  }
  if (candidate.type === "Literal" && candidate.value === null) {
    return { resolved: true, stylingNames: [] };
  }

  return { resolved: false, stylingNames: [] };
}

function bindingPatterns(node) {
  if (node.type === "VariableDeclarator") return [node.id];
  if (
    ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"].includes(node.type)
  ) {
    return node.params ?? [];
  }
  if (node.type === "CatchClause") return [node.param];
  if (node.type === "SnippetBlock") return node.parameters ?? [];
  if (node.type === "EachBlock") return [node.context, node.index];
  if (node.type === "AwaitBlock") return [node.value, node.error];
  return [];
}

function patternIdentifierNames(pattern) {
  if (!pattern || typeof pattern !== "object") return [];
  if (pattern.type === "Identifier") return [pattern.name];
  if (pattern.type === "RestElement") return patternIdentifierNames(pattern.argument);
  if (pattern.type === "AssignmentPattern") return patternIdentifierNames(pattern.left);
  if (pattern.type === "ArrayPattern") {
    return pattern.elements.flatMap((element) => patternIdentifierNames(element));
  }
  if (pattern.type === "ObjectPattern") {
    return pattern.properties.flatMap((property) =>
      patternIdentifierNames(property.type === "RestElement" ? property.argument : property.value)
    );
  }
  return [];
}

function mergeSpreadProofs(proofs) {
  return {
    resolved: proofs.every(({ resolved }) => resolved),
    stylingNames: [...new Set(proofs.flatMap(({ stylingNames }) => stylingNames))].sort(),
  };
}

function publicHtmlAttributeTypeProof(
  node,
  publicTypeNames,
  typeAliases,
  typePreservingWrappers,
  seen = new Set()
) {
  if (!node || typeof node !== "object") return { proven: false, rooted: false };

  if (node.type === "TSTypeReference" && node.typeName?.type === "Identifier") {
    if (publicTypeNames.has(node.typeName.name)) return { proven: true, rooted: true };
    if (seen.has(node.typeName.name)) return { proven: false, rooted: false };

    const alias = typeAliases.get(node.typeName.name);
    if (alias) {
      return publicHtmlAttributeTypeProof(
        alias,
        publicTypeNames,
        typeAliases,
        typePreservingWrappers,
        new Set([...seen, node.typeName.name])
      );
    }

    if (typePreservingWrappers.includes(node.typeName.name)) {
      return publicHtmlAttributeTypeProof(
        node.typeParameters?.params?.[0] ?? node.typeArguments?.params?.[0],
        publicTypeNames,
        typeAliases,
        typePreservingWrappers,
        seen
      );
    }
    return { proven: false, rooted: false };
  }

  if (node.type === "TSIntersectionType") {
    const proofs = node.types.map((entry) =>
      publicHtmlAttributeTypeProof(
        entry,
        publicTypeNames,
        typeAliases,
        typePreservingWrappers,
        seen
      )
    );
    return {
      proven: proofs.length > 0 && proofs.every(({ proven }) => proven),
      rooted: proofs.some(({ rooted }) => rooted),
    };
  }
  if (node.type === "TSUnionType") {
    const proofs = node.types.map((entry) =>
      publicHtmlAttributeTypeProof(
        entry,
        publicTypeNames,
        typeAliases,
        typePreservingWrappers,
        seen
      )
    );
    return {
      proven: proofs.length > 0 && proofs.every(({ proven }) => proven),
      rooted: proofs.length > 0 && proofs.every(({ rooted }) => rooted),
    };
  }
  if (node.type === "TSTypeLiteral") {
    return {
      proven: node.members.every((member) => safeTypeMember(member)),
      rooted: false,
    };
  }
  if (node.type === "TSParenthesizedType") {
    return publicHtmlAttributeTypeProof(
      node.typeAnnotation,
      publicTypeNames,
      typeAliases,
      typePreservingWrappers,
      seen
    );
  }

  return { proven: false, rooted: false };
}

function safeTypeMember(member) {
  if (!["TSPropertySignature", "TSMethodSignature"].includes(member.type) || member.computed) {
    return false;
  }
  const name = staticPropertyName(member.key)?.toLowerCase();
  return name !== undefined && !["class", "style"].includes(name);
}

function isPropsCall(node) {
  const candidate = unwrapExpression(node);
  return candidate?.type === "CallExpression" && candidate.callee?.name === "$props";
}
