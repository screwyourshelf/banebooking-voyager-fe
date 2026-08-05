import type { CSSProperties } from "react";
import CardSection from "@/components/layout/CardSection";
import SectionHeading from "@/components/layout/SectionHeading";
import type { BookingPerMåned } from "@/features/statistikk/types";
import { formatMånedsnavn, formatTimer } from "@/features/statistikk/statistikkPresentation";

type Props = {
  punkter: BookingPerMåned[];
  visSammenligning: boolean;
};

const høyde = 260;
const topp = 24;
const bunn = 42;
const venstre = 46;
const høyre = 24;

function lagLinje(
  punkter: BookingPerMåned[],
  hentVerdi: (punkt: BookingPerMåned) => number | null,
  maks: number,
  bredde: number
) {
  const tegnebredde = bredde - venstre - høyre;
  const tegnehøyde = høyde - topp - bunn;
  const avstand = punkter.length > 1 ? tegnebredde / (punkter.length - 1) : 0;

  return punkter.flatMap((punkt, indeks) => {
    const verdi = hentVerdi(punkt);
    if (verdi === null) return [];
    return [
      {
        x: punkter.length > 1 ? venstre + indeks * avstand : venstre + tegnebredde / 2,
        y: topp + (1 - verdi / maks) * tegnehøyde,
        verdi,
        punkt,
      },
    ];
  });
}

function tilPolyline(punkter: ReturnType<typeof lagLinje>) {
  return punkter.map(({ x, y }) => `${x},${y}`).join(" ");
}

export default function BookingerPerMånedChart({ punkter, visSammenligning }: Props) {
  const maks = Math.max(
    1,
    ...punkter.flatMap((punkt) => [punkt.bookedeTimer, punkt.sammenligningBookedeTimer ?? 0])
  );
  const bredde = Math.max(620, (punkter.length - 1) * 76 + venstre + høyre);
  const flereÅr = new Set(punkter.map((punkt) => punkt.år)).size > 1;
  const nåværende = lagLinje(punkter, (punkt) => punkt.bookedeTimer, maks, bredde);
  const sammenligning = lagLinje(punkter, (punkt) => punkt.sammenligningBookedeTimer, maks, bredde);
  const rutenett = [0, 0.25, 0.5, 0.75, 1];

  return (
    <CardSection className="statistics-section statistics-month-chart">
      <SectionHeading
        className="statistics-month-chart__heading"
        description="Bookede timer per måned i den valgte perioden."
        actions={
          <span className="statistics-chart-legend" aria-label="Tegnforklaring">
            <span data-series="current">Valgt periode</span>
            {visSammenligning ? <span data-series="previous">Året før</span> : null}
          </span>
        }
        size="lg"
      >
        Utvikling gjennom perioden
      </SectionHeading>

      <div className="statistics-month-chart__scroll">
        <div
          className="statistics-month-chart__plot"
          style={{ "--statistics-line-chart-width": `${bredde}px` } as CSSProperties}
        >
          <svg
            viewBox={`0 0 ${bredde} ${høyde}`}
            role="img"
            aria-label="Linjediagram over bookede timer per måned"
          >
            <title>Utvikling i bookede timer per måned</title>

            {rutenett.map((andel) => {
              const y = topp + (1 - andel) * (høyde - topp - bunn);
              return (
                <g key={andel} className="statistics-line-chart__grid">
                  <line x1={venstre} x2={bredde - høyre} y1={y} y2={y} />
                  <text x={venstre - 8} y={y + 4} textAnchor="end">
                    {formatTimer(Math.round(maks * andel))}
                  </text>
                </g>
              );
            })}

            {visSammenligning && sammenligning.length > 1 ? (
              <polyline
                className="statistics-line-chart__line"
                data-series="previous"
                points={tilPolyline(sammenligning)}
              />
            ) : null}
            {nåværende.length > 1 ? (
              <polyline
                className="statistics-line-chart__line"
                data-series="current"
                points={tilPolyline(nåværende)}
              />
            ) : null}

            {visSammenligning
              ? sammenligning.map(({ x, y, verdi, punkt }) => (
                  <circle
                    key={`forrige-${punkt.år}-${punkt.måned}`}
                    className="statistics-line-chart__point"
                    data-series="previous"
                    cx={x}
                    cy={y}
                    r="4"
                  >
                    <title>{`${formatMånedsnavn(punkt.måned)} året før: ${formatTimer(verdi)}`}</title>
                  </circle>
                ))
              : null}

            {nåværende.map(({ x, y, verdi, punkt }) => {
              const måned = formatMånedsnavn(punkt.måned);
              const etikett = flereÅr ? `${måned} ${String(punkt.år).slice(-2)}` : måned;
              return (
                <g key={`${punkt.år}-${punkt.måned}`}>
                  <circle
                    className="statistics-line-chart__point"
                    data-series="current"
                    cx={x}
                    cy={y}
                    r="4.5"
                  >
                    <title>{`${måned} ${punkt.år}: ${formatTimer(verdi)}`}</title>
                  </circle>
                  <text
                    className="statistics-line-chart__label"
                    x={x}
                    y={høyde - 13}
                    textAnchor="middle"
                  >
                    {etikett}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </CardSection>
  );
}
