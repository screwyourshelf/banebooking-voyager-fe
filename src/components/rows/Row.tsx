import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    title?: ReactNode;
    description?: ReactNode;
    right?: ReactNode;
    children?: ReactNode;
    className?: string;
    density?: "default" | "compact";
};

export default function Row({
    title,
    description,
    right,
    children,
    className,
    density = "default",
}: Props) {
    const py = density === "compact" ? "py-2" : "py-3";
    const hasHeader = !!title || !!description || !!right;

    return (
        <div className={cn("px-3", py, className)}>
            {hasHeader ? (
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        {title ? <div className="text-sm font-medium leading-5">{title}</div> : null}
                        {description ? (
                            <div className="mt-1 text-xs text-muted-foreground leading-4">
                                {description}
                            </div>
                        ) : null}
                    </div>

                    {right ? <div className="shrink-0">{right}</div> : null}
                </div>
            ) : null}

            {children ? <div className={cn(hasHeader && "mt-2")}>{children}</div> : null}
        </div>
    );
}
