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
    <section data-ui="metric-grid" data-variant={variant} aria-label={label}>
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
    <Card size="sm" data-ui="metric">
      <CardContent data-part="content">
        <span data-part="icon" aria-hidden="true">
          {icon}
        </span>
        <span data-part="value">
          <small data-stat-role="chart-label">{label}</small>
          <strong data-stat-role="key-value">
            {value}
            {unit ? <span data-part="unit"> {unit}</span> : null}
          </strong>
          <span data-stat-role="chart-meta">{description}</span>
        </span>
        {change ? (
          <span data-part="change" data-direction={direction} data-stat-role="chart-meta">
            {change}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
