import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarDays, SlidersHorizontal } from "lucide-react";
import CardSection from "@/components/layout/CardSection";
import SectionHeading from "@/components/layout/SectionHeading";
import DatePickerPopover from "@/components/controls/DatePickerPopover";
import { SwitchRow } from "@/components/rows";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaneRespons, GrenRespons } from "@/types";
import type { BookingstatistikkFiltre, StatistikkPeriodevalg } from "@/features/statistikk/types";

type Props = {
  filtre: BookingstatistikkFiltre;
  periodevalg: StatistikkPeriodevalg;
  grener: GrenRespons[];
  baner: BaneRespons[];
  disabled?: boolean;
  onPeriodevalgChange: (valg: StatistikkPeriodevalg) => void;
  onFraChange: (dato: Date) => void;
  onTilChange: (dato: Date) => void;
  onSammenligningChange: (checked: boolean) => void;
  onGrenChange: (grenId: string | null) => void;
  onBaneChange: (baneId: string | null) => void;
};

const periodevalgAlternativer: Array<{ value: StatistikkPeriodevalg; label: string }> = [
  { value: "året-så-langt", label: "Året så langt" },
  { value: "forrige-år", label: "Forrige kalenderår" },
  { value: "siste-12", label: "Siste 12 måneder" },
  { value: "egendefinert", label: "Egendefinert periode" },
];

function isoTilDato(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

function Datoknapp({ label, dato }: { label: string; dato: string }) {
  return (
    <Button type="button" variant="outline" className="statistics-controls__date-button">
      <CalendarDays aria-hidden="true" />
      <span>
        <small>{label}</small>
        {format(isoTilDato(dato), "d. MMM yyyy", { locale: nb })}
      </span>
    </Button>
  );
}

export default function StatistikkFilter({
  filtre,
  periodevalg,
  grener,
  baner,
  disabled = false,
  onPeriodevalgChange,
  onFraChange,
  onTilChange,
  onSammenligningChange,
  onGrenChange,
  onBaneChange,
}: Props) {
  return (
    <CardSection className="statistics-controls" padding="sm">
      <SectionHeading
        description="Velg periode og avgrens statistikken til en gren eller bane."
        actions={<SlidersHorizontal aria-hidden="true" />}
      >
        Visning
      </SectionHeading>

      <div className="statistics-controls__grid">
        <label className="statistics-controls__field">
          <span>Periode</span>
          <Select
            value={periodevalg}
            onValueChange={(value) => onPeriodevalgChange(value as StatistikkPeriodevalg)}
            disabled={disabled}
          >
            <SelectTrigger aria-label="Velg periode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodevalgAlternativer.map((alternativ) => (
                <SelectItem key={alternativ.value} value={alternativ.value}>
                  {alternativ.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="statistics-controls__field">
          <span>Gren</span>
          <Select
            value={filtre.grenId ?? "alle"}
            onValueChange={(value) => onGrenChange(value === "alle" ? null : value)}
            disabled={disabled}
          >
            <SelectTrigger aria-label="Velg gren">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle grener</SelectItem>
              {grener.map((gren) => (
                <SelectItem key={gren.id} value={gren.id}>
                  {gren.navn}
                  {gren.aktiv ? "" : " (inaktiv)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="statistics-controls__field">
          <span>Bane</span>
          <Select
            value={filtre.baneId ?? "alle"}
            onValueChange={(value) => onBaneChange(value === "alle" ? null : value)}
            disabled={disabled}
          >
            <SelectTrigger aria-label="Velg bane">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle baner</SelectItem>
              {baner.map((bane) => (
                <SelectItem key={bane.id} value={bane.id}>
                  {bane.navn}
                  {bane.aktiv ? "" : " (inaktiv)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <SwitchRow
          className="statistics-controls__comparison"
          title="Sammenlign med året før"
          description="Bruker samme datoer ett år tidligere"
          checked={filtre.sammenlignMedForrigeÅr}
          onCheckedChange={onSammenligningChange}
          disabled={disabled}
        />
      </div>

      {periodevalg === "egendefinert" ? (
        <div className="statistics-controls__dates">
          <DatePickerPopover value={isoTilDato(filtre.fra)} onChange={onFraChange} align="start">
            <Datoknapp label="Fra" dato={filtre.fra} />
          </DatePickerPopover>
          <DatePickerPopover
            value={isoTilDato(filtre.til)}
            onChange={onTilChange}
            minDate={isoTilDato(filtre.fra)}
            align="start"
          >
            <Datoknapp label="Til" dato={filtre.til} />
          </DatePickerPopover>
        </div>
      ) : null}
    </CardSection>
  );
}
