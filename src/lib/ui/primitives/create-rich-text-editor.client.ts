import { Editor, type Content, type JSONContent } from "@tiptap/core";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";
import type {
  CreateRichTextEditorOptions,
  RichTextEditorAccessibility,
  RichTextEditorCommand,
  RichTextEditorController,
  RichTextEditorToggle,
} from "./rich-text-editor-controller";

export class InvalidRichTextContentError extends Error {
  constructor(cause?: unknown) {
    super("Den lagrede presentasjonsteksten har et format editoren ikke kan lese.", { cause });
    this.name = "InvalidRichTextContentError";
  }
}

function parseContent(value: string): Content {
  if (!value.trim()) return "";

  try {
    const content: unknown = JSON.parse(value);
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      throw new TypeError("Tiptap-roten må være et JSON-objekt.");
    }
    return content as JSONContent;
  } catch (error) {
    if (error instanceof InvalidRichTextContentError) throw error;
    throw new InvalidRichTextContentError(error);
  }
}

function serializeContent(editor: Editor): string {
  return JSON.stringify(editor.getJSON());
}

function setAccessibilityAttributes(
  editor: Editor,
  accessibility: RichTextEditorAccessibility
): void {
  const element = editor.view.dom;
  const attributes: Record<string, string | undefined> = {
    "aria-describedby": accessibility.describedBy,
    "aria-invalid": accessibility.invalid ? "true" : undefined,
    "aria-label": accessibility.labelledBy ? undefined : accessibility.label,
    "aria-labelledby": accessibility.labelledBy,
    "aria-multiline": "true",
    "aria-required": accessibility.required ? "true" : undefined,
    id: accessibility.id,
    role: "textbox",
  };

  for (const [name, value] of Object.entries(attributes)) {
    if (value) element.setAttribute(name, value);
    else element.removeAttribute(name);
  }
}

function isToggleActive(editor: Editor, toggle: RichTextEditorToggle): boolean {
  switch (toggle) {
    case "heading-2":
      return editor.isActive("heading", { level: 2 });
    case "heading-3":
      return editor.isActive("heading", { level: 3 });
    case "bullet-list":
      return editor.isActive("bulletList");
    case "ordered-list":
      return editor.isActive("orderedList");
    default:
      return editor.isActive(toggle);
  }
}

function runCommand(editor: Editor, command: RichTextEditorCommand): boolean {
  const chain = editor.chain().focus();

  switch (command) {
    case "bold":
      return chain.toggleBold().run();
    case "italic":
      return chain.toggleItalic().run();
    case "heading-2":
      return chain.toggleHeading({ level: 2 }).run();
    case "heading-3":
      return chain.toggleHeading({ level: 3 }).run();
    case "bullet-list":
      return chain.toggleBulletList().run();
    case "ordered-list":
      return chain.toggleOrderedList().run();
    case "blockquote":
      return chain.toggleBlockquote().run();
    case "table":
      return editor.isActive("table")
        ? chain.deleteTable().run()
        : chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    case "add-column":
      return chain.addColumnAfter().run();
    case "delete-column":
      return chain.deleteColumn().run();
    case "add-row":
      return chain.addRowAfter().run();
    case "delete-row":
      return chain.deleteRow().run();
    case "delete-table":
      return chain.deleteTable().run();
  }
}

export function createRichTextEditor({
  accessibility,
  editable,
  mount,
  onChange,
  onStateChange,
  value,
}: CreateRichTextEditorOptions): RichTextEditorController {
  let editor: Editor;

  try {
    editor = new Editor({
      content: parseContent(value),
      editable,
      element: mount,
      extensions: [
        StarterKit.configure({
          code: false,
          codeBlock: false,
          heading: { levels: [2, 3] },
        }),
        Table.configure({ resizable: false }),
        TableRow,
        TableCell,
        TableHeader,
      ],
      injectCSS: false,
      onBlur: onStateChange,
      onFocus: onStateChange,
      onSelectionUpdate: onStateChange,
      onTransaction: onStateChange,
      onUpdate: ({ editor: updatedEditor }) => onChange(serializeContent(updatedEditor)),
    });
  } catch (error) {
    if (error instanceof InvalidRichTextContentError) throw error;
    throw new InvalidRichTextContentError(error);
  }

  setAccessibilityAttributes(editor, accessibility);

  return {
    destroy: () => editor.destroy(),
    focus: () => editor.commands.focus(),
    isActive: (toggle) => isToggleActive(editor, toggle),
    run: (command) => runCommand(editor, command),
    setAccessibility: (nextAccessibility) => setAccessibilityAttributes(editor, nextAccessibility),
    setContent: (nextValue) => {
      if (nextValue.trim() && nextValue === serializeContent(editor)) return;
      if (!nextValue.trim() && editor.isEmpty) return;
      editor.commands.setContent(parseContent(nextValue), { emitUpdate: false });
      onStateChange();
    },
    setEditable: (nextEditable) => editor.setEditable(nextEditable, false),
  };
}
