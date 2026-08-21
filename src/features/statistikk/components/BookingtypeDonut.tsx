import type { BookingNøkkeltall } from "@/features/statistikk/types";
import { formatAntallMedEnhet } from "@/features/statistikk/statistikkPresentation";
import { Section } from "@/components";

type Props = {
  nøkkeltall: BookingNøkkeltall;
};

const radius = 48;
const omkrets = 2 * Math.PI * radius;

function formatAndel(antall: number, totalt: number) {
  if (totalt === 0) return "0 %";
  return `${Math.round((antall / totalt) * 100)} %`;
}

export default function BookingtypeDonut({ nøkkeltall }: Props) {
  const personlig = nøkkeltall.personligeBookinger;
  const arrangement = nøkkeltall.arrangementbookinger;
  const totalt = personlig + arrangement;
  const personligLengde = totalt > 0 ? (personlig / totalt) * omkrets : 0;
  const arrangementLengde = totalt > 0 ? (arrangement / totalt) * omkrets : 0;

  return (
    <Section variant="surface" data-context="statistics" data-view="booking-types">
      <Section.Heading description="Andel personlige bookinger og arrangementsbookinger.">
        Bookingtype
      </Section.Heading>

      <div className="statistics-booking-types__content">
        <div className="statistics-booking-types__chart">
          <svg viewBox="0 0 128 128" role="img" aria-label="Fordeling mellom bookingtyper">
            <title>{`${formatAntallMedEnhet(personlig)} personlige bookinger (${formatAndel(personlig, totalt)}) og ${formatAntallMedEnhet(arrangement)} arrangementsbookinger (${formatAndel(arrangement, totalt)})`}</title>
            <circle className="statistics-donut__track" cx="64" cy="64" r={radius} />
            <circle
              className="statistics-donut__segment"
              data-series="current"
              cx="64"
              cy="64"
              r={radius}
              strokeDasharray={`${personligLengde} ${omkrets}`}
            />
            <circle
              className="statistics-donut__segment"
              data-series="previous"
              cx="64"
              cy="64"
              r={radius}
              strokeDasharray={`${arrangementLengde} ${omkrets}`}
              strokeDashoffset={-personligLengde}
            />
          </svg>
          <span aria-hidden="true">
            <strong data-stat-role="chart-value">{formatAntallMedEnhet(totalt)}</strong>
            <small data-stat-role="chart-meta">bookinger</small>
          </span>
        </div>

        <dl className="statistics-booking-types__legend">
          <div data-series="current">
            <dt data-stat-role="chart-label">Personlige</dt>
            <dd>
              <strong data-stat-role="chart-value">{formatAntallMedEnhet(personlig)}</strong>
              <span data-stat-role="chart-meta">{formatAndel(personlig, totalt)}</span>
            </dd>
          </div>
          <div data-series="previous">
            <dt data-stat-role="chart-label">Arrangement</dt>
            <dd>
              <strong data-stat-role="chart-value">{formatAntallMedEnhet(arrangement)}</strong>
              <span data-stat-role="chart-meta">{formatAndel(arrangement, totalt)}</span>
            </dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
