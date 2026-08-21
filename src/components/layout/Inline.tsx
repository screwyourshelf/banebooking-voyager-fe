import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  gap?: "xs" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
};

export default function Inline({
  children,
  className,
  gap = "md",
  align = "center",
  justify = "start",
  wrap = false,
}: Props) {
  return (
    <div
      className={className}
      data-ui="inline"
      data-gap={gap}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap || undefined}
    >
      {children}
    </div>
  );
}
