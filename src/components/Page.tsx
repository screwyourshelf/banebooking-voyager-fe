import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageProps = {
  children: ReactNode;
  className?: string;
  width?: "md" | "lg" | "xl" | "full";
};

const widthClass: Record<NonNullable<PageProps["width"]>, string> = {
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-none",
};

export default function Page({ children, className, width = "md" }: PageProps) {
  return (
    <div className={cn(widthClass[width], "mx-auto px-2 md:px-4 py-3 md:py-5", className)}>
      {children}
    </div>
  );
}
