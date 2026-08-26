/**
 * Native attributes that public UI may forward without exposing styling as a prop API.
 * Visual ownership stays with the primitive or pattern that renders the element.
 */
export type PublicHtmlAttributes<Attributes> = Omit<Attributes, "class" | "style">;
