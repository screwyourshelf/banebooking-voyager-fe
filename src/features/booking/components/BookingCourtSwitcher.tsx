import ChoiceStrip from "@/components/controls/ChoiceStrip";
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
    <ChoiceStrip
      ariaLabel="Bytt bane"
      className="booking-court-switcher"
      items={baner.map((bane) => {
        const erValgt = bane.id === valgtBaneId;

        return {
          id: bane.id,
          content: (
            <>
              <span className="choice-strip__label">{bane.navn}</span>
              {erValgt && ledigeAntall !== undefined ? (
                <>
                  <span
                    className="choice-strip__availability"
                    data-empty={ledigeAntall === 0}
                    aria-hidden="true"
                  >
                    <span>(</span>
                    <span className="choice-strip__dot" />
                    <span>{ledigeAntall}</span>
                    <span>)</span>
                  </span>
                  <span className="sr-only">{ledigeAntall} ledige tider</span>
                </>
              ) : null}
            </>
          ),
        };
      })}
      selectedId={valgtBaneId}
      onSelect={onBaneChange}
    />
  );
}
