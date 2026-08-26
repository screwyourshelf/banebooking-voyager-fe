// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import RichTextContent from "./RichTextContent.svelte";
import { parseRichTextContent } from "./rich-text-content";

describe("rich text content", () => {
  it("eier leseflaten med statiske semantiske utilities", () => {
    const { container } = render(RichTextContent, { value: "Første linje\nAndre linje" });

    expect(container.querySelector('[data-ui="rich-text-content"]')).toHaveClass(
      "whitespace-pre-wrap",
      "rich-text-content-heading:font-rich-text-content-heading",
      "rich-text-content-list:gap-rich-text-content-list",
      "rich-text-content-quote:border-rich-text-content-quote-border",
      "rich-text-content-table:min-w-rich-text-content-table",
      "rich-text-content-cell:border-line"
    );
  });

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
