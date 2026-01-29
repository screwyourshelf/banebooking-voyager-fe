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

    /** Ekstra props sendes rett til <Input /> */
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
                {...inputProps}
                className={cn(
                    "bg-background",
                    error && "border-destructive",
                    inputProps?.className
                )}
            />
        </FieldWrapper>
    );
}
