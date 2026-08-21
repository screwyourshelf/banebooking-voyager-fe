import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  as?: "div" | "section" | "ul";
};

export default function Stack({ children, className, gap = "md", as: Tag = "div" }: Props) {
  return (
    <Tag className={className} data-ui="stack" data-gap={gap}>
      {children}
    </Tag>
  );
}
