import { Fragment } from "react";
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
    <PageSection>
      <div className="flex flex-col gap-2 px-2 py-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold">{tittel}</h2>
            {datoTekst && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3 shrink-0" />
                {datoTekst}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {STATUS_REKKEFØLGE.map((s, i) => {
              const gjeldende = s === status;
              const passert = STATUS_REKKEFØLGE.indexOf(status) > i;
              return (
                <Fragment key={s}>
                  {i > 0 && (
                    <span
                      className={cn(
                        "text-xs select-none shrink-0",
                        passert ? "text-muted-foreground/40" : "text-muted-foreground/20"
                      )}
                    >
                      ›
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-xs shrink-0 flex items-center gap-1",
                      gjeldende && "text-foreground font-medium",
                      passert && "text-muted-foreground/50",
                      !gjeldende && !passert && "text-muted-foreground/30"
                    )}
                  >
                    {gjeldende && (
                      <span className={cn("size-1.5 rounded-full shrink-0", statusDotClass[s])} />
                    )}
                    {statusLabels[s]}
                  </span>
                </Fragment>
              );
            })}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </PageSection>
  );
}
