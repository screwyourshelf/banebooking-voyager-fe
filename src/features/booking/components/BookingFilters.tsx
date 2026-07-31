import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { BaneRespons, GrenRespons } from "@/types";

type Props = {
  grener: GrenRespons[];
  valgtGrenId: string;
  onGrenChange: (grenId: string) => void;
  baner: BaneRespons[];
  valgtBaneId: string;
  onBaneChange: (baneId: string) => void;
  visBaner?: boolean;
  className?: string;
};

export default function BookingFilters({
  grener,
  valgtGrenId,
  onGrenChange,
  baner,
  valgtBaneId,
  onBaneChange,
  visBaner = true,
  className,
}: Props) {
  const brukBanevelger = baner.length > 1 || baner.some((bane) => bane.navn.trim().length > 18);

  return (
    <div className={cn("booking-filter-panel", className)}>
      {grener.length > 1 ? (
        <div className="booking-filter-group">
          <div className="booking-filter-group__label">Aktivitet</div>
          <div className="booking-choice-list">
            {grener.map((gren) => (
              <button
                key={gren.id}
                type="button"
                className="booking-choice"
                data-active={gren.id === valgtGrenId}
                aria-pressed={gren.id === valgtGrenId}
                onClick={() => onGrenChange(gren.id)}
              >
                <span className="booking-choice__dot" aria-hidden="true" />
                {gren.navn}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {visBaner ? (
        <div className="booking-filter-group booking-filter-group--courts">
          <div className="booking-filter-group__label">Bane</div>
          {brukBanevelger ? (
            <Select value={valgtBaneId} onValueChange={onBaneChange}>
              <SelectTrigger className="booking-court-select" aria-label="Velg bane">
                <SelectValue placeholder="Velg bane" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {baner.map((bane) => (
                  <SelectItem key={bane.id} value={bane.id}>
                    {bane.navn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="booking-choice-list">
              {baner.map((bane) => (
                <button
                  key={bane.id}
                  type="button"
                  className="booking-choice"
                  data-active={bane.id === valgtBaneId}
                  aria-pressed={bane.id === valgtBaneId}
                  onClick={() => onBaneChange(bane.id)}
                >
                  {bane.navn}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
