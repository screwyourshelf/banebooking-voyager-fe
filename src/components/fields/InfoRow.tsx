import type { ReactNode } from "react";
import FieldRow from "@/components/fields/FieldRow";
import { cn } from "@/lib/utils";

type Props = {
    label: string;
    value: ReactNode;
    description?: string;
    className?: string;
    density?: "default" | "compact";
};

export default function InfoRow({
    label,
    value,
    description,
    className,
    density = "default",
}: Props) {
    return (
        <FieldRow
            title={label}
            description={description}
            density={density}
            className={className}
        >
            <div className={cn("text-sm text-foreground break-words")}>{value}</div>
        </FieldRow>
    );
}
