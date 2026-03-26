import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  gap?: "xs" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
};

const gapClass: Record<NonNullable<Props["gap"]>, string> = {
  xs: "gap-1",
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-3",
};

const alignClass: Record<NonNullable<Props["align"]>, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
};

const justifyClass: Record<NonNullable<Props["justify"]>, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
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
      className={cn(
        "flex",
        gapClass[gap],
        alignClass[align],
        justifyClass[justify],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
}
