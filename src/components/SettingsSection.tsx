import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    tone?: "soft" | "plain";
    intent?: "default" | "danger";
};

export default function SettingsSection({
    title,
    description,
    children,
    className,
    tone = "soft",
    intent = "default",
}: Props) {
    return (
        <section
            className={cn(
                "rounded-lg p-3 space-y-3",
                tone === "soft" && "bg-muted/40",
                intent === "danger" && "border border-destructive/20 bg-destructive/5",
                className
            )}
        >
            {title || description ? (
                <div>
                    {title ? (
                        <div className="text-sm font-semibold">{title}</div>
                    ) : null}
                    {description ? (
                        <div className="text-sm text-muted-foreground mt-1">
                            {description}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {children}
        </section>
    );
}
