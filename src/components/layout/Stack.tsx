import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  as?: "div" | "section" | "ul";
};

const gapClass: Record<NonNullable<Props["gap"]>, string> = {
  xs: "gap-1 md:gap-1.5",
  sm: "gap-2 md:gap-3",
  md: "gap-3 md:gap-4",
  lg: "gap-4 md:gap-6",
  xl: "gap-6 md:gap-8",
};

export default function Stack({ children, className, gap = "md", as: Tag = "div" }: Props) {
  return <Tag className={cn("flex flex-col", gapClass[gap], className)}>{children}</Tag>;
}
