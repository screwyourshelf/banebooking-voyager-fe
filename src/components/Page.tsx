import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageProps = {
  children: ReactNode;
  className?: string;
  width?: "md" | "lg" | "full";
};

const widthClass: Record<NonNullable<PageProps["width"]>, string> = {
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  full: "max-w-none",
};

export default function Page({ children, className, width = "md" }: PageProps) {
  return <div className={cn(widthClass[width], "mx-auto px-1 py-2", className)}>{children}</div>;
}
