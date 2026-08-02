import {
  norskeKalenderEtiketter,
  norskKalenderLocale,
} from "@/components/controls/kalenderLokalisering";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  value: Date[];
  onChange: (dates: Date[]) => void;
  ariaLabel?: string;
};

export default function DatoFlervelger({ value, onChange, ariaLabel = "Velg datoer" }: Props) {
  return (
    <div className="date-calendar-frame" role="group" aria-label={ariaLabel}>
      <Calendar
        mode="multiple"
        selected={value}
        defaultMonth={value[0]}
        onSelect={(dates) => onChange(dates ?? [])}
        locale={norskKalenderLocale}
        labels={norskeKalenderEtiketter}
      />
    </div>
  );
}
