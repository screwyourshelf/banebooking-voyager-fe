import { Fragment } from "react";
import type { ReactNode } from "react";
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
      <div className="tournament-header">
        <div className="app-min-width-0">
          <div className="app-inline app-inline--baseline">
            <h2 className="app-text-heading">{tittel}</h2>
            {datoTekst && (
              <span className="tournament-header__date">
                <Calendar className="app-icon-xs" />
                {datoTekst}
              </span>
            )}
          </div>
          <div className="tournament-status-track">
            {STATUS_REKKEFØLGE.map((s, i) => {
              const gjeldende = s === status;
              const passert = STATUS_REKKEFØLGE.indexOf(status) > i;
              return (
                <Fragment key={s}>
                  {i > 0 && (
                    <span
                      className="tournament-status-track__separator"
                      data-past={passert || undefined}
                    >
                      ›
                    </span>
                  )}
                  <span
                    className="tournament-status-track__item"
                    data-current={gjeldende || undefined}
                    data-past={passert || undefined}
                  >
                    {gjeldende && <span className="tournament-status-track__dot" data-status={s} />}
                    {statusLabels[s]}
                  </span>
                </Fragment>
              );
            })}
          </div>
        </div>
        {actions ? <div className="app-shrink-0">{actions}</div> : null}
      </div>
    </PageSection>
  );
}
