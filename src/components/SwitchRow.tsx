import { Switch } from "@/components/ui/switch";

type Props = {
    title: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    variant?: "card" | "flat";
};

export default function SwitchRow({
    title,
    description,
    checked,
    onCheckedChange,
    disabled = false,
    className = "",
    variant = "card",
}: Props) {
    return (
        <div
            className={[
                "flex items-start justify-between gap-3",
                variant === "card" ? "rounded-md border bg-background p-3" : "p-0",
                className,
            ].join(" ")}
        >
            <div className="min-w-0">
                <div className="text-sm font-medium leading-5">{title}</div>
                {description ? (
                    <div className="text-xs text-muted-foreground mt-1 leading-4">{description}</div>
                ) : null}
            </div>

            <div className="shrink-0 pt-0.5">
                <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
            </div>
        </div>
    );
}

