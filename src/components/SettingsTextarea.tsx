import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    className?: string;
};

export default function SettingsTextarea({
    value,
    onChange,
    placeholder,
    rows = 4,
    disabled,
    className,
}: Props) {
    return (
        <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={cn("w-full", className)}
        />
    );
}
