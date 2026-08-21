import type { CSSProperties } from "react";
import { formatTimer } from "@/features/statistikk/statistikkPresentation";
import { Section } from "@/components";

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
    <Section variant="surface" data-context="statistics" data-view="distribution">
      <Section.Heading description={description}>{title}</Section.Heading>

      {oppsummering ? (
        <p className="statistics-distribution__summary" data-stat-role="chart-label">
          {oppsummering}
        </p>
      ) : null}

      <div className="statistics-distribution__list">
        {punkter.map((punkt) => (
          <div key={punkt.id} className="statistics-distribution__row">
            <div className="statistics-distribution__label">
              <strong data-stat-role="chart-label">{punkt.label}</strong>
              <span data-stat-role="chart-meta">
                <strong data-stat-role="chart-value">{formatTimer(punkt.bookedeTimer)}</strong>
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
    </Section>
  );
}
