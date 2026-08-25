/**
 * Extract var() dependencies from a parsed CSS declaration value.
 *
 * The scanner follows CSS token boundaries instead of assuming that the custom-property name is
 * adjacent to `var(`. It ignores strings and comments, accepts whitespace/comments before the
 * first argument, and keeps scanning fallbacks for nested var() calls.
 */
export function customPropertyReferences(value) {
  const references = [];

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '"' || character === "'") {
      index = skipString(value, index, character);
      continue;
    }
    if (startsComment(value, index)) {
      index = skipComment(value, index);
      continue;
    }
    const openingParenthesis = varFunctionOpeningParenthesis(value, index);
    if (openingParenthesis === null) continue;
    const argumentStart = skipWhitespaceAndComments(value, openingParenthesis + 1);
    const reference = readCustomPropertyName(value, argumentStart);
    if (reference !== null) references.push(reference);
  }

  return references;
}

function varFunctionOpeningParenthesis(value, index) {
  if (index > 0 && (isIdentifierCodePoint(value[index - 1]) || value[index - 1] === "\\")) {
    return null;
  }
  const identifier = readCssIdentifier(value, index);
  if (identifier.decoded.toLowerCase() !== "var") return null;
  const openingParenthesis = skipComments(value, identifier.end);
  return value[openingParenthesis] === "(" ? openingParenthesis : null;
}

function readCssIdentifier(value, start) {
  let cursor = start;
  let decoded = "";

  while (cursor < value.length) {
    const character = value[cursor];
    if (isIdentifierCodePoint(character)) {
      decoded += character;
      cursor += 1;
      continue;
    }
    if (character === "\\") {
      const escape = consumeEscape(value, cursor);
      decoded += escape.decoded;
      cursor = escape.end;
      continue;
    }
    if (startsComment(value, cursor)) {
      cursor = skipComment(value, cursor) + 1;
      continue;
    }
    break;
  }

  return { decoded, end: cursor };
}

function readCustomPropertyName(value, index) {
  if (value[index] !== "-" || value[index + 1] !== "-") return null;

  let cursor = index + 2;
  while (cursor < value.length) {
    const character = value[cursor];
    if (isIdentifierCodePoint(character)) {
      cursor += 1;
      continue;
    }
    if (character === "\\") {
      cursor = skipEscape(value, cursor);
      continue;
    }
    break;
  }

  return cursor > index + 2 ? value.slice(index, cursor) : null;
}

function skipWhitespaceAndComments(value, start) {
  let cursor = start;
  while (cursor < value.length) {
    if (/\s/.test(value[cursor])) {
      cursor += 1;
      continue;
    }
    if (startsComment(value, cursor)) {
      cursor = skipComment(value, cursor) + 1;
      continue;
    }
    break;
  }
  return cursor;
}

function skipComments(value, start) {
  let cursor = start;
  while (startsComment(value, cursor)) cursor = skipComment(value, cursor) + 1;
  return cursor;
}

function skipString(value, start, quote) {
  let cursor = start + 1;
  while (cursor < value.length) {
    if (value[cursor] === "\\") {
      cursor = Math.min(skipEscape(value, cursor), value.length - 1);
      continue;
    }
    if (value[cursor] === quote) return cursor;
    cursor += 1;
  }
  return value.length - 1;
}

function skipEscape(value, start) {
  return consumeEscape(value, start).end;
}

function consumeEscape(value, start) {
  let cursor = start + 1;
  let hexadecimal = "";
  let hexadecimalDigits = 0;
  while (cursor < value.length && hexadecimalDigits < 6 && /[0-9A-Fa-f]/.test(value[cursor])) {
    hexadecimal += value[cursor];
    cursor += 1;
    hexadecimalDigits += 1;
  }
  if (hexadecimalDigits > 0 && /\s/.test(value[cursor] ?? "")) cursor += 1;
  if (hexadecimalDigits > 0) {
    const codePoint = Number.parseInt(hexadecimal, 16);
    const decoded =
      codePoint === 0 || codePoint > 0x10ffff ? "\uFFFD" : String.fromCodePoint(codePoint);
    return { decoded, end: cursor };
  }

  const decoded = value[cursor] ?? "";
  if (cursor < value.length) cursor += 1;
  return { decoded, end: cursor };
}

function startsComment(value, index) {
  return value[index] === "/" && value[index + 1] === "*";
}

function skipComment(value, start) {
  const end = value.indexOf("*/", start + 2);
  return end === -1 ? value.length - 1 : end + 1;
}

function isIdentifierCodePoint(character) {
  if (!character) return false;
  return /[A-Za-z0-9_-]/.test(character) || character.codePointAt(0) >= 0x80;
}
