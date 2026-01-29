import { cn } from "@/lib/utils";

type RolleType = "Medlem" | "Utvidet" | "KlubbAdmin";

type Props = {
    value: RolleType[]; // valgte roller (tom = alle)
    onChange: (next: RolleType[]) => void;
    options?: RolleType[];
    className?: string;
};

export default function RoleFilterChips({
    value,
    onChange,
    options = ["Medlem", "Utvidet", "KlubbAdmin"],
    className,
}: Props) {
    const toggle = (r: RolleType) => {
        const exists = value.includes(r);
        onChange(exists ? value.filter((x) => x !== r) : [...value, r]);
    };

    const clear = () => onChange([]);

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {options.map((r) => {
                const active = value.includes(r);
                return (
                    <button
                        key={r}
                        type="button"
                        onClick={() => toggle(r)}
                        className={cn(
                            "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                            active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-input hover:bg-muted"
                        )}
                        aria-pressed={active}
                    >
                        {r}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={clear}
                disabled={value.length === 0}
                className={cn(
                    "ml-auto text-xs underline underline-offset-4",
                    value.length === 0 ? "text-muted-foreground/60 cursor-default" : "text-muted-foreground hover:text-foreground"
                )}
            >
                Nullstill
            </button>
        </div>
    );
}
