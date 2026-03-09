import { Badge } from "@/components/ui/badge";
import type { PaameldingStatus } from "@/types";

const varianter: Record<PaameldingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Sokt: "secondary",
  Godkjent: "default",
  Reserve: "outline",
  Avslatt: "destructive",
  TrukketSeg: "outline",
};

const labels: Record<PaameldingStatus, string> = {
  Sokt: "Søkt",
  Godkjent: "Godkjent",
  Reserve: "Reserve",
  Avslatt: "Avslått",
  TrukketSeg: "Trukket seg",
};

type Props = { status: PaameldingStatus };

export function PaameldingStatusBadge({ status }: Props) {
  return <Badge variant={varianter[status]}>{labels[status]}</Badge>;
}
