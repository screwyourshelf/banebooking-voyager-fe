export type RichTextMark = "bold" | "italic" | "strike";

export type RichTextContentNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content: RichTextContentNode[];
  marks: RichTextMark[];
  text: string;
};

export type ParsedRichTextContent =
  | { kind: "document"; content: RichTextContentNode[] }
  | { kind: "plain"; text: string };

const supportedMarks = new Set<RichTextMark>(["bold", "italic", "strike"]);

function readNode(value: unknown): RichTextContentNode | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.type !== "string") return null;

  const content = Array.isArray(candidate.content)
    ? candidate.content.map(readNode).filter((node): node is RichTextContentNode => node !== null)
    : [];
  const marks = Array.isArray(candidate.marks)
    ? candidate.marks
        .map((mark) =>
          mark && typeof mark === "object" && "type" in mark
            ? (mark as { type?: unknown }).type
            : undefined
        )
        .filter((mark): mark is RichTextMark =>
          typeof mark === "string" ? supportedMarks.has(mark as RichTextMark) : false
        )
    : [];

  return {
    type: candidate.type,
    attrs:
      candidate.attrs && typeof candidate.attrs === "object" && !Array.isArray(candidate.attrs)
        ? (candidate.attrs as Record<string, unknown>)
        : undefined,
    content,
    marks,
    text: typeof candidate.text === "string" ? candidate.text : "",
  };
}

/** Leser editorens avgrensede JSON-format uten HTML og beholder eldre kunngjøringer som ren tekst. */
export function parseRichTextContent(value: string): ParsedRichTextContent {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) return { kind: "plain", text: value };

  try {
    const root = readNode(JSON.parse(trimmed));
    return root?.type === "doc"
      ? { kind: "document", content: root.content }
      : { kind: "plain", text: value };
  } catch {
    return { kind: "plain", text: value };
  }
}
