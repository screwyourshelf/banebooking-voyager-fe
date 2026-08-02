import { addDays, format, startOfDay, subDays } from "date-fns";
import { nb } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import DatePickerPopover from "@/components/controls/DatePickerPopover";
import { Button } from "@/components/ui/button";

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  visNavigering?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
};

function storForbokstav(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function DatoVelger({
  value,
  onChange,
  minDate,
  visNavigering = true,
  ariaLabel = "Velg dato",
  disabled = false,
}: Props) {
  const minimumDate = minDate ? startOfDay(minDate) : undefined;
  const visningsformat = value
    ? storForbokstav(format(value, "EEE d. MMMM", { locale: nb }))
    : "Velg dato";

  const handleForrigeDag = () => {
    if (!value) return;
    const ny = subDays(value, 1);
    if (minimumDate && ny < minimumDate) return;
    onChange(ny);
  };

  const handleNesteDag = () => {
    if (!value) return;
    onChange(addDays(value, 1));
  };

  const disablePrev = disabled || !value || (!!minimumDate && subDays(value, 1) < minimumDate);

  return (
    <div className="date-switcher" data-navigation={visNavigering || undefined}>
      {visNavigering ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Forrige dag"
          onClick={handleForrigeDag}
          className="date-switcher__nav"
          disabled={disablePrev}
        >
          <ChevronLeft />
        </Button>
      ) : null}

      <DatePickerPopover value={value} onChange={onChange} minDate={minimumDate} align="start">
        <Button
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className="date-switcher__value"
          disabled={disabled}
        >
          <span>{visningsformat}</span>
        </Button>
      </DatePickerPopover>

      {visNavigering ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Neste dag"
          onClick={handleNesteDag}
          className="date-switcher__nav"
          disabled={disabled || !value}
        >
          <ChevronRight />
        </Button>
      ) : null}
    </div>
  );
}
