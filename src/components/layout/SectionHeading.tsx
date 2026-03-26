import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-xs font-semibold tracking-wider uppercase text-foreground/80",
  md: "text-sm font-semibold text-foreground",
  lg: "text-base font-semibold text-foreground",
};

export default function SectionHeading({
  children,
  description,
  actions,
  className,
  size = "sm",
}: Props) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className={sizeClass[size]}>{children}</h3>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground max-w-prose">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
