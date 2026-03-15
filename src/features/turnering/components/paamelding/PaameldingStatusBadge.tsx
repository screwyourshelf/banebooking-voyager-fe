import { Badge } from "@/components/ui/badge";

type Props = { trukketSeg: boolean };

export function PaameldingStatusBadge({ trukketSeg }: Props) {
  if (!trukketSeg) return null;
  return <Badge variant="outline">Trukket seg</Badge>;
}
