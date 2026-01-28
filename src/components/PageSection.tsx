import { ReactNode } from "react";

type PageSectionProps = {
    children: ReactNode;
    title?: string;
    description?: string;
    variant?: "default" | "danger";
    className?: string;
};

export default function PageSection({
    children,
    title,
    description,
    variant = "default",
    className = "",
}: PageSectionProps) {
    const header =
        title || description ? (
            <div>
                {title ? (
                    <h3 className="text-sm font-semibold">{title}</h3>
                ) : null}
                {description ? (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                ) : null}
            </div>
        ) : null;

    const cardClass =
        variant === "danger"
            ? "rounded-md border border-destructive/40 bg-destructive/5 p-3"
            : "rounded-md border p-3";

    return (
        <section className={`space-y-3 ${className}`}>
            {header}
            <div className={cardClass}>{children}</div>
        </section>
    );
}
