import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Grid3x3,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
  onChange: (html: string) => void;
  className?: string;
};

export default function TiptapEditor({ content, onChange, className }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={cn("tiptap-editor border rounded-lg overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-0.5 p-1 border-b bg-muted/40">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Fet"
        >
          <Bold />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Kursiv"
        >
          <Italic />
        </Button>

        <div className="w-px bg-border mx-0.5 self-stretch" />

        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Punktliste"
        >
          <List />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Nummerert liste"
        >
          <ListOrdered />
        </Button>

        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Sitat"
        >
          <Quote />
        </Button>

        <div className="w-px bg-border mx-0.5 self-stretch" />

        <Button
          type="button"
          variant={editor.isActive("table") ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7"
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
              className="h-7 w-7"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              aria-label="Legg til kolonne"
              title="Legg til kolonne"
            >
              <Plus className="text-blue-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              aria-label="Slett kolonne"
              title="Slett kolonne"
            >
              <Minus className="text-blue-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              aria-label="Legg til rad"
              title="Legg til rad"
            >
              <Plus className="text-green-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => editor.chain().focus().deleteRow().run()}
              aria-label="Slett rad"
              title="Slett rad"
            >
              <Minus className="text-green-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => editor.chain().focus().deleteTable().run()}
              aria-label="Slett tabell"
              title="Slett tabell"
            >
              <Trash2 className="text-destructive" />
            </Button>
          </>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
