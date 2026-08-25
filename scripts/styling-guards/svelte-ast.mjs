export function walkAst(root, visitor) {
  const seen = new Set();

  function visit(node) {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    visitor(node);
    for (const [key, child] of Object.entries(node)) {
      if (["loc", "metadata", "parent"].includes(key)) continue;
      if (Array.isArray(child)) child.forEach(visit);
      else visit(child);
    }
  }

  visit(root);
}

export function unwrapExpression(node) {
  let candidate = node;
  while (
    candidate &&
    ["ChainExpression", "TSAsExpression", "TSNonNullExpression", "TSSatisfiesExpression"].includes(
      candidate.type
    )
  ) {
    candidate = candidate.expression;
  }
  return candidate;
}

export function staticStringValue(node) {
  const candidate = unwrapExpression(node);
  if (candidate?.type === "Literal" && typeof candidate.value === "string") {
    return candidate.value;
  }
  if (candidate?.type === "TemplateLiteral" && candidate.expressions.length === 0) {
    return candidate.quasis[0]?.value.cooked ?? candidate.quasis[0]?.value.raw ?? "";
  }
  return null;
}

export function staticMemberName(member) {
  if (member?.type !== "MemberExpression") return null;
  if (!member.computed && member.property?.type === "Identifier") return member.property.name;
  return staticStringValue(member.property);
}

export function memberPath(node) {
  const candidate = unwrapExpression(node);
  if (!candidate || typeof candidate !== "object") return [];
  if (candidate.type === "MemberExpression") {
    const propertyName = staticMemberName(candidate);
    return [...memberPath(candidate.object), ...(propertyName ? [propertyName] : [])];
  }
  return [];
}

export function rootIdentifier(node) {
  const candidate = unwrapExpression(node);
  if (candidate?.type === "Identifier") return candidate.name;
  if (candidate?.type === "MemberExpression") return rootIdentifier(candidate.object);
  return null;
}

export function staticPropertyName(key) {
  if (key?.type === "Identifier") return key.name;
  if (key?.type === "Literal" && typeof key.value === "string") return key.value;
  return null;
}

export function offsetLocation(source, offset) {
  const before = source.slice(0, Math.max(offset, 0));
  const lastNewline = before.lastIndexOf("\n");
  return {
    column: before.length - lastNewline,
    line: (before.match(/\n/g)?.length ?? 0) + 1,
  };
}
