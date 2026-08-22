export type RichTextEditorToggle =
  | "bold"
  | "italic"
  | "heading-2"
  | "heading-3"
  | "bullet-list"
  | "ordered-list"
  | "blockquote"
  | "table";

export type RichTextEditorCommand =
  | RichTextEditorToggle
  | "add-column"
  | "delete-column"
  | "add-row"
  | "delete-row"
  | "delete-table";

export type RichTextEditorAccessibility = {
  describedBy?: string;
  id?: string;
  invalid: boolean;
  label: string;
  labelledBy?: string;
  required: boolean;
};

export type RichTextEditorController = {
  destroy(): void;
  focus(): void;
  isActive(toggle: RichTextEditorToggle): boolean;
  run(command: RichTextEditorCommand): boolean;
  setAccessibility(accessibility: RichTextEditorAccessibility): void;
  setContent(value: string): void;
  setEditable(editable: boolean): void;
};

export type CreateRichTextEditorOptions = {
  accessibility: RichTextEditorAccessibility;
  editable: boolean;
  mount: HTMLElement;
  onChange: (value: string) => void;
  onStateChange: () => void;
  value: string;
};
