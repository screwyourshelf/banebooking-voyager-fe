import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import PageSection from "@/components/sections/PageSection";
import { formatDatoKort } from "@/utils/datoUtils";
import type { TurneringStatus } from "@/types";

const statusLabels: Record<TurneringStatus, string> = {
  Oppsett: "Oppsett",
  PaameldingAapen: "Påmelding åpen",
  DrawPublisert: "Draw publisert",
  Pagaar: "Pågår",
  Avsluttet: "Avsluttet",
};

const statusDotClass: Record<TurneringStatus, string> = {
  Oppsett: "bg-muted-foreground/40",
  PaameldingAapen: "bg-primary",
  DrawPublisert: "bg-primary",
  Pagaar: "bg-emerald-500",
  Avsluttet: "bg-muted-foreground/30",
};

function formatDatoTekst(start: string | null, slutt: string | null): string | null {
  if (!start) return null;
  if (!slutt || start === slutt) return formatDatoKort(start);
  return `${formatDatoKort(start)} – ${formatDatoKort(slutt)}`;
}

type Props = {
  tittel: string;
  status: TurneringStatus;
  beskrivelse: string;
  startDato: string | null;
  sluttDato: string | null;
  actions?: ReactNode;
};

export function TurneringHeaderSection({
  tittel,
  status,
  beskrivelse,
  startDato,
  sluttDato,
  actions,
}: Props) {
  const datoTekst = formatDatoTekst(startDato, sluttDato);

  return (
    <PageSection>
      <div className="flex items-start justify-between gap-3 px-2 py-1">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{tittel}</h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className={cn("size-1.5 rounded-full shrink-0", statusDotClass[status])} />
            <span>{statusLabels[status]}</span>
            {datoTekst && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 shrink-0" />
                  {datoTekst}
                </span>
              </>
            )}
          </div>
          {beskrivelse && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{beskrivelse}</p>
          )}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </PageSection>
  );
}
