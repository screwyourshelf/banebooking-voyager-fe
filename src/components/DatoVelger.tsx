import { format, addDays, subDays } from "date-fns";
import { nb } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import DatePickerPopover from "@/components/controls/DatePickerPopover";
import { Button } from "@/components/ui/button";

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  visNavigering?: boolean;
};

export default function DatoVelger({ value, onChange, minDate, visNavigering = true }: Props) {
  const visningsformat = value ? format(value, "EEE d. MMMM", { locale: nb }) : "Velg dato";

  const handleForrigeDag = () => {
    if (!value) return;
    const ny = subDays(value, 1);
    if (minDate && ny < minDate) return;
    onChange(ny);
  };

  const handleNesteDag = () => {
    if (!value) return;
    onChange(addDays(value, 1));
  };

  const disablePrev = !value || (!!minDate && subDays(value, 1) < minDate);

  return (
    <div className="date-switcher">
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

      <DatePickerPopover value={value} onChange={onChange} minDate={minDate} align="start">
        <Button
          type="button"
          variant="outline"
          aria-label="Velg dato"
          className="date-switcher__value"
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
          disabled={!value}
        >
          <ChevronRight />
        </Button>
      ) : null}
    </div>
  );
}
