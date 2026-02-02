import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    children: ReactNode;
    className?: string;
    intent?: "default" | "danger";
};

export default function RowPanel({ children, className, intent = "default" }: Props) {
    return (
        <div
            className={cn(
                "rounded-lg border bg-background",
                intent === "danger" && "border-destructive/40 bg-destructive/5",
                className
            )}
        >
            {children}
        </div>
    );
}
