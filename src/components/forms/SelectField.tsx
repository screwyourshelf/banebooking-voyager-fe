import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FieldControl } from "@/components/forms";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type SelectFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    helpText?: string;
    error?: string | null;
    disabled?: boolean;

    hideLabel?: boolean;
    triggerClassName?: string;
    placeholder?: ReactNode;
};

export default function SelectField({
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
        <FieldControl
            id={id}
            label={label}
            hideLabel={hideLabel}
            helpText={helpText}
            error={error}
        >
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    id={id}
                    className={cn("bg-background", error && "border-destructive", triggerClassName)}
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
        </FieldControl>
    );
}
