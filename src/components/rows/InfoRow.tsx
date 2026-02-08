import type { ReactNode } from "react";
import Row from "@/components/rows/Row";
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
    <Row title={label} description={description} density={density} className={className}>
      <div className={cn("text-sm text-muted-foreground break-words")}>{value}</div>
    </Row>
  );
}
