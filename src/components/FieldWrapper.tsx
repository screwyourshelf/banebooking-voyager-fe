import { Label } from "./ui/label.js";
import type { ReactNode } from "react";

interface FieldWrapperProps {
    id: string;
    label?: string;
    children: ReactNode;
    helpText?: string;
    error?: string | null;
    className?: string;
    hideLabel?: boolean;
}

export function FieldWrapper({
    id,
    label,
    children,
    helpText,
    error,
    className,
    hideLabel = false,
}: FieldWrapperProps) {
    const showHelp = Boolean(helpText) && !error;

    return (
        <div className={`space-y-1 ${className ?? ""}`}>
            {label ? (
                <Label htmlFor={id} className={hideLabel ? "sr-only" : ""}>
                    {label}
                </Label>
            ) : null}

            {showHelp ? (
                <p className="text-xs text-muted-foreground">{helpText}</p>
            ) : null}

            {children}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
