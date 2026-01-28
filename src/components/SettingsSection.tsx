import type { ReactNode } from "react";

type Props = {
    title: string;
    description?: string;
    children: ReactNode;
};

export default function SettingsSection({
    title,
    description,
    children,
}: Props) {
    return (
        <section className="rounded-lg bg-muted/40 p-3 space-y-3">
            <div>
                <div className="text-sm font-semibold">{title}</div>
                {description && (
                    <div className="text-sm text-muted-foreground mt-1">
                        {description}
                    </div>
                )}
            </div>

            {children}
        </section>
    );
}
