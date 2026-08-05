import { LoaderCircle } from "lucide-react";

type Props = {
  label: string;
  rows: number;
  layout: "time" | "date";
  controls: boolean;
};

/** Lett oppstartsvariant som ikke trekker inn interaktive record-kontroller. */
export default function RecordCollectionLoading({ label, rows, layout, controls }: Props) {
  return (
    <section className="record-collection" aria-label={label} aria-busy="true">
      <header className="control-surface record-collection__toolbar">
        <div className="record-collection__summary">
          <span className="record-collection__summary-icon" aria-hidden="true">
            <LoaderCircle className="page-content-skeleton__spinner" />
          </span>
          <span className="record-collection__summary-copy">
            <strong>Laster innhold</strong>
            <small>Gjør siden klar</small>
          </span>
        </div>
      </header>
      {controls ? (
        <div className="page-content-skeleton__controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      <div className="record-collection__body">
        <div
          className="record-collection-skeleton"
          data-layout={layout}
          role="status"
          aria-label={label}
        >
          <div className="record-list">
            {Array.from({ length: rows }, (_, index) => (
              <div key={index} className="record-card">
                <div className="record-collection-skeleton__row" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
