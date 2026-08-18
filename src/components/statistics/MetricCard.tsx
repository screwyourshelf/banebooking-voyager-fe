import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function MetricGrid({
  children,
  variant = "default",
  label,
}: {
  children: ReactNode;
  variant?: "default" | "members";
  label: string;
}) {
  return (
    <section className="statistics-metrics" data-variant={variant} aria-label={label}>
      {children}
    </section>
  );
}

export default function MetricCard({
  label,
  value,
  unit,
  description,
  icon,
  change,
  direction,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  description: ReactNode;
  icon: ReactNode;
  change?: ReactNode;
  direction?: "up" | "down";
}) {
  return (
    <Card size="sm" className="statistics-metric">
      <CardContent className="statistics-metric__content">
        <span className="statistics-metric__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="statistics-metric__copy">
          <small>{label}</small>
          <strong>
            {value}
            {unit ? <span className="statistics-metric__unit"> {unit}</span> : null}
          </strong>
          <span>{description}</span>
        </span>
        {change ? (
          <span className="statistics-metric__change" data-direction={direction}>
            {change}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
