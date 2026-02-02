import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    children: ReactNode;
    className?: string;
    divided?: boolean;
    density?: "default" | "compact";
};

export default function RowList({
    children,
    className,
    divided = true,
    density = "default",
}: Props) {
    return (
        <div
            className={cn(
                "overflow-hidden",
                divided && "divide-y divide-border/60",
                density === "compact" && "text-sm",
                className
            )}
        >
            {children}
        </div>
    );
}
