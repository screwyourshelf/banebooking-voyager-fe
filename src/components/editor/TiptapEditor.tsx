import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, List, ListOrdered, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
  onChange: (html: string) => void;
  className?: string;
};

export default function TiptapEditor({ content, onChange, className }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
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
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
