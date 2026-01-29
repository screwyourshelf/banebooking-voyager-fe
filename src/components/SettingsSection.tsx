import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    intent?: "default" | "danger";
};

export default function SettingsSection({
    title,
    description,
    children,
    className,
    intent = "default",
}: Props) {
    const gradient =
        intent === "danger"
            ? "bg-gradient-to-b from-destructive/12 via-destructive/6 to-background"
            : "bg-gradient-to-b from-muted/90 via-muted/55 to-muted/20";

    return (
        <section
            className={cn(
                "rounded-xl border shadow-sm overflow-hidden",
                intent === "danger" ? "border-destructive/20" : "border-border/60",
                className
            )}
        >
            {/* Gradient wrapper */}
            <div className={cn("py-4", gradient)}>
                {(title || description) && (
                    <div className="px-4 mb-3">
                        {title && (
                            <div className="text-xs font-semibold tracking-wider uppercase text-foreground/80">
                                {title}
                            </div>
                        )}

                        {description && (
                            <div className="mt-1 text-sm text-muted-foreground max-w-prose">
                                {description}
                            </div>
                        )}
                    </div>
                )}

                {/* Innhold: “bredere” enn header */}
                <div className="space-y-3 -mx-2 px-3">{children}</div>
            </div>
        </section>
    );
}
