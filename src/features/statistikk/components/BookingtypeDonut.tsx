import CardSection from "@/components/layout/CardSection";
import SectionHeading from "@/components/layout/SectionHeading";
import type { BookingNøkkeltall } from "@/features/statistikk/types";
import { formatAntallMedEnhet } from "@/features/statistikk/statistikkPresentation";

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
    <CardSection className="statistics-section statistics-booking-types">
      <SectionHeading description="Andel personlige bookinger og arrangementsbookinger." size="lg">
        Bookingtype
      </SectionHeading>

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
            <strong>{formatAntallMedEnhet(totalt)}</strong>
            <small>bookinger</small>
          </span>
        </div>

        <dl className="statistics-booking-types__legend">
          <div data-series="current">
            <dt>Personlige</dt>
            <dd>
              <strong>{formatAntallMedEnhet(personlig)}</strong>
              <span>{formatAndel(personlig, totalt)}</span>
            </dd>
          </div>
          <div data-series="previous">
            <dt>Arrangement</dt>
            <dd>
              <strong>{formatAntallMedEnhet(arrangement)}</strong>
              <span>{formatAndel(arrangement, totalt)}</span>
            </dd>
          </div>
        </dl>
      </div>
    </CardSection>
  );
}
