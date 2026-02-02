import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    children: ReactNode;
    className?: string;

    /** Standard: høyrejustert */
    align?: "left" | "right" | "between";

    /** Luft over actions */
    spaced?: boolean;

    /** Ny: sticky actions nederst på skjermen */
    variant?: "inline" | "sticky";
};

export default function FormActions({
    children,
    className,
    align = "right",
    spaced = true,
    variant = "inline",
}: Props) {
    return (
        <div
            className={cn(
                // base
                "flex items-center gap-2",

                // spacing
                spaced && variant === "inline" && "pt-2",

                // alignment
                align === "right" && "justify-end",
                align === "left" && "justify-start",
                align === "between" && "justify-between",

                // sticky variant (mobil-first)
                variant === "sticky" &&
                cn(
                    "sticky bottom-0 z-10",
                    // “bar” look
                    "border-t bg-background/95 backdrop-blur",
                    // padding som matcher resten
                    "px-4 py-3",
                    // safe area for iOS
                    "pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
                ),

                className
            )}
        >
            {children}
        </div>
    );
}
