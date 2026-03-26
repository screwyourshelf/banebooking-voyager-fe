import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const paddingClass: Record<NonNullable<Props["padding"]>, string> = {
  sm: "p-3 md:p-4",
  md: "p-4 md:p-6",
  lg: "p-6 md:p-8",
};

export default function CardSection({ children, className, padding = "md" }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        paddingClass[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
