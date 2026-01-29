import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
};

export default function SettingsList({ children, className = "" }: Props) {
    return (
        <div
            className={`rounded-md border bg-background divide-y divide-border/60 ${className}`}
        >
            {children}
        </div>
    );
}
