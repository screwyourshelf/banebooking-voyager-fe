import type { CSSProperties } from "react";
import CardSection from "@/components/layout/CardSection";
import SectionHeading from "@/components/layout/SectionHeading";
import type { BookingPerTime } from "@/features/statistikk/types";
import { formatTimer } from "@/features/statistikk/statistikkPresentation";

type Props = {
  punkter: BookingPerTime[];
  visSammenligning: boolean;
};

type Stolpestil = CSSProperties & { "--statistics-bar-height": string };

export default function TidPåDøgnetChart({ punkter, visSammenligning }: Props) {
  const timerMedAktivitet = punkter
    .filter((punkt) => punkt.bookedeTimer > 0 || (punkt.sammenligningBookedeTimer ?? 0) > 0)
    .map((punkt) => punkt.time);
  const førsteTime = Math.max(0, Math.min(...timerMedAktivitet) - 1);
  const sisteTime = Math.min(23, Math.max(...timerMedAktivitet) + 1);
  const synligePunkter = punkter.filter(
    (punkt) => punkt.time >= førsteTime && punkt.time <= sisteTime
  );
  const maks = Math.max(
    1,
    ...synligePunkter.flatMap((punkt) => [punkt.bookedeTimer, punkt.sammenligningBookedeTimer ?? 0])
  );

  return (
    <CardSection className="statistics-section statistics-hour-chart">
      <SectionHeading
        description="Når på døgnet banene brukes mest."
        actions={
          visSammenligning ? (
            <span className="statistics-chart-legend" aria-label="Tegnforklaring">
              <span data-series="current">Valgt periode</span>
              <span data-series="previous">Året før</span>
            </span>
          ) : null
        }
        size="lg"
      >
        Tid på døgnet
      </SectionHeading>

      <div className="statistics-hour-chart__scroll">
        <div
          className="statistics-hour-chart__plot"
          role="img"
          aria-label="Stolpediagram over bookede timer per klokkeslett"
          style={{ "--statistics-hour-count": synligePunkter.length } as CSSProperties}
        >
          {synligePunkter.map((punkt) => {
            const sammenligning = punkt.sammenligningBookedeTimer;
            const klokkeslett = `${String(punkt.time).padStart(2, "0")}:00`;
            const ariaLabel =
              sammenligning === null
                ? `${klokkeslett}: ${formatTimer(punkt.bookedeTimer)}`
                : `${klokkeslett}: ${formatTimer(punkt.bookedeTimer)}. Året før: ${formatTimer(sammenligning)}`;

            return (
              <div key={punkt.time} className="statistics-hour-chart__hour" aria-label={ariaLabel}>
                <div className="statistics-hour-chart__bars" aria-hidden="true">
                  <span
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
                <strong>{formatTimer(punkt.bookedeTimer)}</strong>
                <span>{String(punkt.time).padStart(2, "0")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </CardSection>
  );
}
