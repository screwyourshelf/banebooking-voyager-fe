import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  density?: "default" | "compact";

  /** Visuell seksjonering uten "card" */
  tone?: "plain" | "soft";
};

export default function PageSection({
  title,
  description,
  actions,
  children,
  className,
  density = "compact",
  tone = "soft",
}: Props) {
  const gap = density === "compact" ? "space-y-1 md:space-y-2" : "space-y-2 md:space-y-3";
  const showHeader = !!title || !!description || !!actions;

  return (
    <section
      className={cn(
        "rounded-xl",
        tone === "soft" && "bg-gradient-to-b from-muted/60 via-muted/25 to-transparent",
        tone === "soft" && (density === "compact" ? "py-2 md:py-3" : "py-3 md:py-4"),
        className
      )}
    >
      {showHeader ? (
        <div className="px-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? (
                <div className="text-xs font-semibold tracking-wider uppercase text-foreground/80">
                  {title}
                </div>
              ) : null}

              {description ? (
                <div className="mt-1 text-sm text-muted-foreground max-w-prose">{description}</div>
              ) : null}
            </div>

            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </div>
      ) : null}

      <div className={cn("px-1 md:px-2", showHeader ? "mt-3 md:mt-4" : "", gap)}>{children}</div>
    </section>
  );
}
