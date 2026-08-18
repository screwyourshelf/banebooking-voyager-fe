import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  variant?:
    | "body"
    | "small"
    | "caption"
    | "heading"
    | "subheading"
    | "muted"
    | "empty"
    | "danger"
    | "strong";
  align?: "start" | "center" | "end";
  truncate?: boolean;
};

export default function Text({
  children,
  as: Tag = "p",
  variant = "body",
  align = "start",
  truncate = false,
}: Props) {
  return (
    <Tag
      className="app-text"
      data-variant={variant}
      data-align={align}
      data-truncate={truncate || undefined}
    >
      {children}
    </Tag>
  );
}
