import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  gap?: "sm" | "md" | "lg";
  as?: "div" | "section" | "dl";
};

export default function Grid({ children, columns = 1, gap = "md", as: Tag = "div" }: Props) {
  return (
    <Tag className="app-grid" data-columns={columns} data-gap={gap}>
      {children}
    </Tag>
  );
}
