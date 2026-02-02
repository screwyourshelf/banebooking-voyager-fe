import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type FieldControlProps = {
    id: string;
    label?: string;
    children: ReactNode;
    helpText?: string;
    error?: string | null;
    className?: string;
    hideLabel?: boolean;
};

export default function FieldControl({
    id,
    label,
    children,
    helpText,
    error,
    className,
    hideLabel = false,
}: FieldControlProps) {
    const showHelp = Boolean(helpText) && !error;

    const helpId = `${id}-help`;
    const errorId = `${id}-error`;

    return (
        <div className={cn("space-y-1", className)}>
            {label ? (
                <Label htmlFor={id} className={hideLabel ? "sr-only" : ""}>
                    {label}
                </Label>
            ) : null}

            {showHelp ? (
                <p id={helpId} className="text-xs text-muted-foreground">
                    {helpText}
                </p>
            ) : null}

            {children}

            {error ? (
                <p id={errorId} className="text-sm text-destructive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
