import type { CSSProperties } from "react";
import CardSection from "@/components/layout/CardSection";
import SectionHeading from "@/components/layout/SectionHeading";
import { formatTimer } from "@/features/statistikk/statistikkPresentation";

export type FordelingPunkt = {
  id: string;
  label: string;
  bookedeTimer: number;
  sammenligningBookedeTimer: number | null;
};

type Props = {
  title: string;
  description: string;
  punkter: FordelingPunkt[];
  oppsummering?: string;
};

type Stolpestil = CSSProperties & { "--statistics-bar-width": string };

export default function FordelingBarListe({ title, description, punkter, oppsummering }: Props) {
  const maks = Math.max(
    1,
    ...punkter.flatMap((punkt) => [punkt.bookedeTimer, punkt.sammenligningBookedeTimer ?? 0])
  );

  return (
    <CardSection className="statistics-section statistics-distribution">
      <SectionHeading description={description} size="lg">
        {title}
      </SectionHeading>

      {oppsummering ? <p className="statistics-distribution__summary">{oppsummering}</p> : null}

      <div className="statistics-distribution__list">
        {punkter.map((punkt) => (
          <div key={punkt.id} className="statistics-distribution__row">
            <div className="statistics-distribution__label">
              <strong>{punkt.label}</strong>
              <span>
                {formatTimer(punkt.bookedeTimer)}
                {punkt.sammenligningBookedeTimer !== null
                  ? ` · året før ${formatTimer(punkt.sammenligningBookedeTimer)}`
                  : ""}
              </span>
            </div>
            <div className="statistics-distribution__bars" aria-hidden="true">
              <span
                data-series="current"
                style={
                  {
                    "--statistics-bar-width": `${(punkt.bookedeTimer / maks) * 100}%`,
                  } as Stolpestil
                }
              />
              {punkt.sammenligningBookedeTimer !== null ? (
                <span
                  data-series="previous"
                  style={
                    {
                      "--statistics-bar-width": `${(punkt.sammenligningBookedeTimer / maks) * 100}%`,
                    } as Stolpestil
                  }
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </CardSection>
  );
}
