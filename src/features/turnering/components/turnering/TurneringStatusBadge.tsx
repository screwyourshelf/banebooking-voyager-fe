import { Badge } from "@/components/ui/badge";
import type { TurneringStatus } from "@/types";

const varianter: Record<TurneringStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Oppsett: "secondary",
  PaameldingAapen: "default",
  DrawPublisert: "default",
  Pagaar: "default",
  Avsluttet: "outline",
};

const labels: Record<TurneringStatus, string> = {
  Oppsett: "Oppsett",
  PaameldingAapen: "Påmelding åpen",
  DrawPublisert: "Draw publisert",
  Pagaar: "Pågår",
  Avsluttet: "Avsluttet",
};

type Props = { status: TurneringStatus };

export function TurneringStatusBadge({ status }: Props) {
  return <Badge variant={varianter[status]}>{labels[status]}</Badge>;
}
