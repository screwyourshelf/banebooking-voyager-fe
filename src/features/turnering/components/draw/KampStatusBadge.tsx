import { Badge } from "@/components/ui/badge";
import type { KampStatus } from "@/types";

const varianter: Record<KampStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Planlagt: "outline",
  Pagaar: "default",
  Ferdig: "secondary",
  WalkOver: "outline",
  Utsatt: "secondary",
  Bye: "outline",
};

const labels: Record<KampStatus, string> = {
  Planlagt: "Planlagt",
  Pagaar: "Pågår",
  Ferdig: "Ferdig",
  WalkOver: "W/O",
  Utsatt: "Utsatt",
  Bye: "BYE",
};

type Props = { status: KampStatus };

export function KampStatusBadge({ status }: Props) {
  return <Badge variant={varianter[status]}>{labels[status]}</Badge>;
}
