import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Grid3x3,
  Plus,
  Minus,
  Trash2,
  Heading2,
  Heading3,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export type TiptapEditorProps = {
  content: string;
  onChange: (json: string) => void;
  className?: string;
};

export default function TiptapEditor({ content, onChange, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content ? JSON.parse(content) : "",
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const currentJson = JSON.stringify(editor.getJSON());
    if (content !== currentJson) {
      editor.commands.setContent(content ? JSON.parse(content) : "", { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={className} data-ui="editor">
      <div data-part="toolbar">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="icon"
          data-part="control"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Fet"
        >
          <Bold />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="icon"
          data-part="control"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Kursiv"
        >
          <Italic />
        </Button>

        <div data-part="separator" />

        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          size="icon"
          data-part="control"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Overskrift 2"
          title="Overskrift (H2)"
        >
          <Heading2 />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          size="icon"
          data-part="control"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Overskrift 3"
          title="Underoverskrift (H3)"
        >
          <Heading3 />
        </Button>

        <div data-part="separator" />

        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="icon"
          data-part="control"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Punktliste"
        >
          <List />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="icon"
          data-part="control"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Nummerert liste"
        >
          <ListOrdered />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="icon"
          data-part="control"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Sitat"
        >
          <Quote />
        </Button>

        <div data-part="separator" />

        <Button
          type="button"
          variant={editor.isActive("table") ? "secondary" : "ghost"}
          size="icon"
          data-part="control"
          onClick={() =>
            editor.isActive("table")
              ? editor.chain().focus().deleteTable().run()
              : editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          aria-label="Tabell"
          title={editor.isActive("table") ? "Slett tabell" : "Sett inn tabell"}
        >
          <Grid3x3 />
        </Button>

        {editor.isActive("table") && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-part="control"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              aria-label="Legg til kolonne"
              title="Legg til kolonne"
            >
              <Plus data-part="table-icon" data-tone="column" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-part="control"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              aria-label="Slett kolonne"
              title="Slett kolonne"
            >
              <Minus data-part="table-icon" data-tone="column" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-part="control"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              aria-label="Legg til rad"
              title="Legg til rad"
            >
              <Plus data-part="table-icon" data-tone="row" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-part="control"
              onClick={() => editor.chain().focus().deleteRow().run()}
              aria-label="Slett rad"
              title="Slett rad"
            >
              <Minus data-part="table-icon" data-tone="row" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-part="control"
              onClick={() => editor.chain().focus().deleteTable().run()}
              aria-label="Slett tabell"
              title="Slett tabell"
            >
              <Trash2 data-part="table-icon" data-tone="danger" />
            </Button>
          </>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
