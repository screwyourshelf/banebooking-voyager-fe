import { describe, expect, it } from "vitest";
import { parseRichTextContent } from "./rich-text-content";

describe("rich text content", () => {
  it("beholder eldre kunngjøringer som ren tekst", () => {
    expect(parseRichTextContent("Første linje\nAndre linje")).toEqual({
      kind: "plain",
      text: "Første linje\nAndre linje",
    });
  });

  it("validerer den avgrensede Tiptap-roten og filtrerer ukjente marks", () => {
    const parsed = parseRichTextContent(
      JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Viktig", marks: [{ type: "bold" }, { type: "link" }] },
            ],
          },
        ],
      })
    );
    expect(parsed).toMatchObject({
      kind: "document",
      content: [{ type: "paragraph", content: [{ text: "Viktig", marks: ["bold"] }] }],
    });
  });
});
