import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { nb } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  value: Date | null;
  onChange: (date: Date) => void;
};

const ANTALL_HURTIGDAGER = 6;

function hurtiglabel(dato: Date, indeks: number) {
  if (indeks === 0) return "I dag";
  if (indeks === 1) return "I morgen";
  return format(dato, "EEE", { locale: nb }).replace(".", "");
}

export default function BookingDateNavigator({ value, onChange }: Props) {
  const iDag = startOfDay(new Date());
  const hurtigdager = Array.from({ length: ANTALL_HURTIGDAGER }, (_, indeks) =>
    addDays(iDag, indeks)
  );
  const erAnnenDato = value != null && !hurtigdager.some((dato) => isSameDay(dato, value));

  return (
    <section className="booking-date-nav" aria-label="Velg dag">
      <div className="booking-date-nav__scroller">
        {hurtigdager.map((dato, indeks) => {
          const erValgt = value != null && isSameDay(dato, value);

          return (
            <button
              key={dato.toISOString()}
              type="button"
              className="booking-date-nav__day"
              data-active={erValgt}
              aria-pressed={erValgt}
              onClick={() => onChange(dato)}
            >
              <span>{hurtiglabel(dato, indeks)}</span>
              <strong>{format(dato, "d. MMM", { locale: nb })}</strong>
            </button>
          );
        })}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="booking-date-nav__calendar"
            data-active={erAnnenDato}
            aria-label="Velg en annen dato"
          >
            <span>{erAnnenDato && value ? format(value, "d. MMM", { locale: nb }) : "Dato"}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(dato) => {
              if (dato) onChange(dato);
            }}
            locale={nb}
          />
        </PopoverContent>
      </Popover>
    </section>
  );
}
