import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    autoComplete?: string;
    disabled?: boolean;
    className?: string;

    // valgfritt
    min?: number;
    max?: number;
    step?: number;
};

export default function SettingsInput({
    value,
    onChange,
    placeholder,
    type = "text",
    inputMode,
    autoComplete,
    disabled,
    className,
    min,
    max,
    step,
}: Props) {
    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn("w-full", className)}
        />
    );
}
