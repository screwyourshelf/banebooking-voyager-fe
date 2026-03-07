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
  const gap = density === "compact" ? "space-y-1" : "space-y-2";
  const showHeader = !!title || !!description || !!actions;

  return (
    <section
      className={cn(
        "rounded-xl",
        tone === "soft" && "bg-gradient-to-b from-muted/60 via-muted/25 to-transparent",
        // litt "kort-padding" uten border/shadow
        tone === "soft" && (density === "compact" ? "py-1" : "py-2"),
        className
      )}
    >
      {showHeader ? (
        <div className="px-1">
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

      <div className={cn("px-1", showHeader ? "mt-3" : "", gap)}>{children}</div>
    </section>
  );
}
