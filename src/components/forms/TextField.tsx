import type { ChangeEvent, InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import FieldControl from "./FieldControl";

type TextFieldProps = {
    id: string;
    label: string;
    value: string;

    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;

    onValueChange?: (value: string) => void;

    helpText?: string;
    error?: string | null;
    hideLabel?: boolean;

    inputProps?: Omit<
        InputHTMLAttributes<HTMLInputElement>,
        "id" | "value" | "onChange"
    >;
};

export default function TextField({
    id,
    label,
    value,
    onChange,
    onValueChange,
    helpText,
    error,
    hideLabel = false,
    inputProps,
}: TextFieldProps) {
    const describedByIds = [
        helpText && !error ? `${id}-help` : null,
        error ? `${id}-error` : null,
    ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
        <FieldControl
            id={id}
            label={label}
            hideLabel={hideLabel}
            helpText={helpText}
            error={error}
        >
            <Input
                id={id}
                value={value}
                onChange={(e) => {
                    onChange?.(e);
                    onValueChange?.(e.target.value);
                }}
                aria-invalid={!!error}
                aria-describedby={describedByIds}
                {...inputProps}
                className={cn(
                    "bg-background",
                    error && "border-destructive focus-visible:ring-destructive",
                    inputProps?.className
                )}
            />
        </FieldControl>
    );
}
