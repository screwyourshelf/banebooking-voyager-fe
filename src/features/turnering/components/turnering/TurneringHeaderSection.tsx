import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDatoKort } from "@/utils/datoUtils";
import type { TurneringStatus } from "@/types";
import { Section } from "@/components";

const statusLabels: Record<TurneringStatus, string> = {
  Oppsett: "Oppsett",
  PaameldingAapen: "Påmelding åpen",
  DrawPublisert: "Draw publisert",
  Pagaar: "Pågår",
  Avsluttet: "Avsluttet",
};

const STATUS_REKKEFØLGE: TurneringStatus[] = [
  "Oppsett",
  "PaameldingAapen",
  "DrawPublisert",
  "Pagaar",
  "Avsluttet",
];

function formatDatoTekst(start: string | null, slutt: string | null): string | null {
  if (!start) return null;
  if (!slutt || start === slutt) return formatDatoKort(start);
  return `${formatDatoKort(start)} – ${formatDatoKort(slutt)}`;
}

type Props = {
  tittel: string;
  status: TurneringStatus;
  startDato: string | null;
  sluttDato: string | null;
  actions?: ReactNode;
};

export function TurneringHeaderSection({ tittel, status, startDato, sluttDato, actions }: Props) {
  const datoTekst = formatDatoTekst(startDato, sluttDato);

  return (
    <Section title={tittel} description={datoTekst ?? undefined} actions={actions}>
      <div>
        {STATUS_REKKEFØLGE.map((steg) => {
          const stegIndex = STATUS_REKKEFØLGE.indexOf(steg);
          const statusIndex = STATUS_REKKEFØLGE.indexOf(status);
          const variant =
            steg === status ? "default" : stegIndex < statusIndex ? "secondary" : "outline";

          return (
            <Badge key={steg} variant={variant}>
              {statusLabels[steg]}
            </Badge>
          );
        })}
      </div>
    </Section>
  );
}
