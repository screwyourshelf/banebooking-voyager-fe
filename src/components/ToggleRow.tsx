import { Switch } from "@/components/ui/switch";

type ToggleRowProps = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
    disabled?: boolean;
    className?: string;
};

export default function ToggleRow({
    label,
    checked,
    onChange,
    description,
    disabled = false,
    className = "",
}: ToggleRowProps) {
    return (
        <div className={`flex items-center justify-between gap-3 rounded-md border p-3 ${className}`}>
            <div className="min-w-0">
                <div className="text-sm font-medium leading-5">{label}</div>
                {description ? (
                    <div className="text-xs text-muted-foreground mt-1 leading-4">
                        {description}
                    </div>
                ) : null}
            </div>

            <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
        </div>
    );
}
