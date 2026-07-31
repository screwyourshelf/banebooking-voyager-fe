import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { nb } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ControlChoice from "@/components/controls/ControlChoice";

import type { GrenRespons } from "@/types";

type Props = {
  grener: GrenRespons[];
  valgtGrenId: string;
  onGrenChange: (grenId: string) => void;
  valgtDato: Date | null;
  onDatoChange: (dato: Date | null) => void;
};

export default function BookingMobileControls({
  grener,
  valgtGrenId,
  onGrenChange,
  valgtDato,
  onDatoChange,
}: Props) {
  const iDag = startOfDay(new Date());
  const iMorgen = addDays(iDag, 1);
  const erAnnenDato =
    valgtDato !== null && !isSameDay(valgtDato, iDag) && !isSameDay(valgtDato, iMorgen);
  const vistDato = valgtDato ?? iDag;
  const vistDatoKort = format(vistDato, "d. MMM", { locale: nb });
  const vistDatoLang = format(vistDato, "d. MMMM", { locale: nb });

  return (
    <div className="booking-mobile-controls">
      <div className="booking-mobile-controls__group">
        <div className="booking-mobile-controls__activities" aria-label="Velg aktivitet">
          {grener.map((gren) => (
            <ControlChoice
              key={gren.id}
              className="booking-mobile-controls__activity"
              selected={gren.id === valgtGrenId}
              onClick={() => onGrenChange(gren.id)}
            >
              {gren.navn}
            </ControlChoice>
          ))}
        </div>
      </div>

      <div className="booking-mobile-controls__group">
        <div className="booking-mobile-controls__quick-dates" aria-label="Velg dag">
          <ControlChoice
            className="booking-mobile-controls__quick-date"
            selected={valgtDato ? isSameDay(valgtDato, iDag) : false}
            onClick={() => onDatoChange(iDag)}
          >
            I dag
          </ControlChoice>
          <ControlChoice
            className="booking-mobile-controls__quick-date"
            selected={valgtDato ? isSameDay(valgtDato, iMorgen) : false}
            onClick={() => onDatoChange(iMorgen)}
          >
            I morgen
          </ControlChoice>
          <Popover>
            <PopoverTrigger asChild>
              <ControlChoice
                className="booking-mobile-controls__quick-date"
                selected={erAnnenDato}
                aria-label={`Velg dato. Viser ${vistDatoLang}`}
              >
                {vistDatoKort}
              </ControlChoice>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={valgtDato ?? undefined}
                locale={nb}
                onSelect={(dato) => {
                  if (dato) onDatoChange(dato);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
