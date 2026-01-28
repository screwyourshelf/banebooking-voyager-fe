import type { ReactNode } from "react";

type Props = {
    title: string;
    description?: string;
    right?: ReactNode;
    children?: ReactNode; // for value lines / links under
    className?: string;
};

export default function SettingsRow({
    title,
    description,
    right,
    children,
    className = "",
}: Props) {
    return (
        <div className={`p-3 ${className}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-sm font-medium leading-5">{title}</div>
                    {description ? (
                        <div className="text-xs text-muted-foreground mt-1 leading-4">
                            {description}
                        </div>
                    ) : null}
                </div>

                {right ? <div className="shrink-0">{right}</div> : null}
            </div>

            {children ? <div className="mt-2">{children}</div> : null}
        </div>
    );
}
