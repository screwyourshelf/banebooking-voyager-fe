import type { CSSProperties } from "react";
import CardSection from "@/components/layout/CardSection";
import SectionHeading from "@/components/layout/SectionHeading";
import type { BookingPerMåned } from "@/features/statistikk/types";
import { formatMånedsnavn, formatTimer } from "@/features/statistikk/statistikkPresentation";

type Props = {
  punkter: BookingPerMåned[];
  visSammenligning: boolean;
};

type Stolpestil = CSSProperties & { "--statistics-bar-height": string };

export default function BookingerPerMånedChart({ punkter, visSammenligning }: Props) {
  const maks = Math.max(
    1,
    ...punkter.flatMap((punkt) => [punkt.bookedeTimer, punkt.sammenligningBookedeTimer ?? 0])
  );
  const flereÅr = new Set(punkter.map((punkt) => punkt.år)).size > 1;

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
          role="img"
          aria-label="Stolpediagram over bookede timer per måned"
          style={{ "--statistics-month-count": punkter.length } as CSSProperties}
        >
          {punkter.map((punkt) => {
            const måned = formatMånedsnavn(punkt.måned);
            const etikett = flereÅr ? `${måned} ${String(punkt.år).slice(-2)}` : måned;
            const sammenligning = punkt.sammenligningBookedeTimer;
            const ariaLabel =
              sammenligning === null
                ? `${måned} ${punkt.år}: ${formatTimer(punkt.bookedeTimer)}`
                : `${måned} ${punkt.år}: ${formatTimer(punkt.bookedeTimer)}. Året før: ${formatTimer(sammenligning)}`;

            return (
              <div key={`${punkt.år}-${punkt.måned}`} className="statistics-month-chart__month">
                <div className="statistics-month-chart__bars" aria-label={ariaLabel}>
                  <span
                    className="statistics-month-chart__bar"
                    data-series="current"
                    style={
                      {
                        "--statistics-bar-height": `${(punkt.bookedeTimer / maks) * 100}%`,
                      } as Stolpestil
                    }
                    title={`${formatTimer(punkt.bookedeTimer)} – valgt periode`}
                  />
                  {visSammenligning ? (
                    <span
                      className="statistics-month-chart__bar"
                      data-series="previous"
                      style={
                        {
                          "--statistics-bar-height": `${((sammenligning ?? 0) / maks) * 100}%`,
                        } as Stolpestil
                      }
                      title={`${formatTimer(sammenligning ?? 0)} – året før`}
                    />
                  ) : null}
                </div>
                <span className="statistics-month-chart__label">{etikett}</span>
              </div>
            );
          })}
        </div>
      </div>
    </CardSection>
  );
}
