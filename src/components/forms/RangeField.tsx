import type { ChangeEvent, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import FieldControl from "./FieldControl";

type RangeFieldProps = {
    id: string;

    /** Bruk title fra FieldRow her, gjerne med hideLabel */
    label?: string;

    value: number;

    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: number) => void;

    helpText?: string;
    error?: string | null;
    hideLabel?: boolean;

    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;

    inputProps?: Omit<
        InputHTMLAttributes<HTMLInputElement>,
        "id" | "type" | "value" | "min" | "max" | "step" | "disabled" | "onChange"
    >;
};

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

export default function RangeField({
    id,
    label,
    value,
    onChange,
    onValueChange,
    helpText,
    error,
    hideLabel = false,
    min = 0,
    max = 10,
    step = 1,
    disabled = false,
    inputProps,
}: RangeFieldProps) {
    const describedByIds =
        [
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
            <input
                id={id}
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                onChange={(e) => {
                    onChange?.(e);
                    const raw = Number(e.target.value);
                    const next = Number.isFinite(raw) ? clamp(raw, min, max) : value;
                    onValueChange?.(next);
                }}
                aria-invalid={!!error}
                aria-describedby={describedByIds}
                {...inputProps}
                className={cn(
                    "w-full h-4",
                    "accent-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    disabled && "opacity-60",
                    error && "accent-destructive",
                    inputProps?.className
                )}
            />
        </FieldControl>
    );
}
