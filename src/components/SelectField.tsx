import type { ReactNode } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select.js";
import { FieldWrapper } from "./FieldWrapper.js";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    helpText?: string;
    error?: string | null;
    disabled?: boolean;

    /** Matcher FormField */
    hideLabel?: boolean;

    /** Ekstra klasser på trigger */
    triggerClassName?: string;

    /** Placeholder hvis value er tom */
    placeholder?: ReactNode;
}

export function SelectField({
    id,
    label,
    value,
    onChange,
    options,
    helpText,
    error,
    disabled = false,
    hideLabel = false,
    triggerClassName,
    placeholder,
}: SelectFieldProps) {
    return (
        <FieldWrapper
            id={id}
            label={label}
            hideLabel={hideLabel}
            helpText={helpText}
            error={error}
        >
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    id={id}
                    className={cn(
                        "bg-background",
                        error && "border-destructive",
                        triggerClassName
                    )}
                >
                    <SelectValue placeholder={placeholder ?? "Velg..."} />
                </SelectTrigger>

                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FieldWrapper>
    );
}
