import { format, addDays, subDays } from "date-fns";
import { nb } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  visNavigering?: boolean;
};

export default function DatoVelger({ value, onChange, minDate, visNavigering = true }: Props) {
  const visningsformat = value ? format(value, "EEE d. MMMM", { locale: nb }) : "Velg dato";

  const forrigeDag = () => {
    if (!value) return;
    const ny = subDays(value, 1);
    if (minDate && ny < minDate) return;
    onChange(ny);
  };

  const nesteDag = () => {
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
          onClick={forrigeDag}
          className="date-switcher__nav"
          disabled={disablePrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : null}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-label="Velg dato"
            className="date-switcher__value"
          >
            <span>{visningsformat}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(dato) => {
              if (!dato) return;
              if (minDate && dato < minDate) return;
              onChange(dato);
            }}
            locale={nb}
            hidden={minDate ? { before: minDate } : undefined}
          />
        </PopoverContent>
      </Popover>

      {visNavigering ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Neste dag"
          onClick={nesteDag}
          className="date-switcher__nav"
          disabled={!value}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
