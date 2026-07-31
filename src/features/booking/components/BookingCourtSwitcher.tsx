import type { BaneRespons } from "@/types";

type Props = {
  baner: BaneRespons[];
  valgtBaneId: string;
  onBaneChange: (baneId: string) => void;
  ledigeAntall?: number;
};

export default function BookingCourtSwitcher({
  baner,
  valgtBaneId,
  onBaneChange,
  ledigeAntall,
}: Props) {
  if (baner.length <= 1) {
    return null;
  }

  return (
    <div className="booking-court-switcher" data-many={baner.length > 3} aria-label="Bytt bane">
      <div className="booking-court-switcher__scroller">
        {baner.map((bane) => {
          const erValgt = bane.id === valgtBaneId;

          return (
            <button
              key={bane.id}
              type="button"
              className="booking-court-switcher__tab"
              data-active={erValgt}
              aria-pressed={erValgt}
              onClick={() => onBaneChange(bane.id)}
            >
              <span className="booking-court-switcher__name">{bane.navn}</span>
              {erValgt && ledigeAntall !== undefined ? (
                <>
                  <span
                    className="booking-court-switcher__availability"
                    data-empty={ledigeAntall === 0}
                    aria-hidden="true"
                  >
                    <span>(</span>
                    <span className="booking-court-switcher__dot" />
                    <span>{ledigeAntall}</span>
                    <span>)</span>
                  </span>
                  <span className="sr-only">{ledigeAntall} ledige tider</span>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
