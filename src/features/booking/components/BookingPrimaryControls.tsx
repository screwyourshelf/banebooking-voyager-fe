import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { nb } from "date-fns/locale";

import ControlChoice from "@/components/controls/ControlChoice";
import DatePickerPopover from "@/components/controls/DatePickerPopover";

import type { GrenRespons } from "@/types";

type Props = {
  grener: GrenRespons[];
  valgtGrenId: string;
  onGrenChange: (grenId: string) => void;
  valgtDato: Date | null;
  onDatoChange: (dato: Date | null) => void;
};

export default function BookingPrimaryControls({
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
    <div className="booking-primary-controls">
      <div className="booking-primary-controls__group">
        <div className="booking-primary-controls__activities" aria-label="Velg gren">
          {grener.map((gren) => (
            <ControlChoice
              key={gren.id}
              className="booking-primary-controls__activity"
              selected={gren.id === valgtGrenId}
              onClick={() => onGrenChange(gren.id)}
            >
              {gren.navn}
            </ControlChoice>
          ))}
        </div>
      </div>

      <div className="booking-primary-controls__group">
        <div className="booking-primary-controls__quick-dates" aria-label="Velg dag">
          <ControlChoice
            className="booking-primary-controls__quick-date"
            selected={valgtDato ? isSameDay(valgtDato, iDag) : false}
            onClick={() => onDatoChange(iDag)}
          >
            I dag
          </ControlChoice>
          <ControlChoice
            className="booking-primary-controls__quick-date"
            selected={valgtDato ? isSameDay(valgtDato, iMorgen) : false}
            onClick={() => onDatoChange(iMorgen)}
          >
            I morgen
          </ControlChoice>
          <DatePickerPopover value={valgtDato} onChange={onDatoChange} align="end">
            <ControlChoice
              className="booking-primary-controls__quick-date"
              selected={erAnnenDato}
              aria-label={`Velg dato. Viser ${vistDatoLang}`}
            >
              {vistDatoKort}
            </ControlChoice>
          </DatePickerPopover>
        </div>
      </div>
    </div>
  );
}
