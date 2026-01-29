import type { ChangeEvent, InputHTMLAttributes } from "react";
import { Input } from "./ui/input.js";
import { FieldWrapper } from "./FieldWrapper.js";
import { cn } from "@/lib/utils";

interface FormFieldProps {
    id: string;
    label: string;
    value: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    helpText?: string;
    error?: string | null;
    hideLabel?: boolean;

    inputProps?: Omit<
        InputHTMLAttributes<HTMLInputElement>,
        "id" | "value" | "onChange"
    >;
}

export function FormField({
    id,
    label,
    value,
    onChange,
    helpText,
    error,
    hideLabel = false,
    inputProps,
}: FormFieldProps) {
    const errorId = `${id}-error`;

    return (
        <FieldWrapper
            id={id}
            label={label}
            hideLabel={hideLabel}
            helpText={helpText}
            error={error}
        >
            <Input
                id={id}
                value={value}
                onChange={onChange}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                {...inputProps}
                className={cn(
                    "bg-background",
                    error && "border-destructive focus-visible:ring-destructive",
                    inputProps?.className
                )}
            />
            {/* Skjult “kobling” for a11y. Visuell tekst rendres allerede i FieldWrapper */}
            {error ? <span id={errorId} className="sr-only">{error}</span> : null}
        </FieldWrapper>
    );
}
