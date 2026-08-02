import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageProps = {
  children: ReactNode;
  className?: string;
  width?: "md" | "lg" | "xl" | "full";
};

export default function Page({ children, className, width = "md" }: PageProps) {
  return (
    <div className={cn("page-frame", className)} data-width={width}>
      {children}
    </div>
  );
}
