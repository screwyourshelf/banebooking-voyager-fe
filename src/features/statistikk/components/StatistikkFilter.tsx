import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarDays, SlidersHorizontal } from "lucide-react";
import DatePickerPopover from "@/components/controls/DatePickerPopover";
import {
  RecordCollection,
  RecordCollectionHeader,
  type RecordControlField,
  type RecordControlGroup,
} from "@/components/records";
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

function Datoknapp({ label, dato, disabled }: { label: string; dato: string; disabled: boolean }) {
  const formatertDato = format(isoTilDato(dato), "d. MMM yyyy", { locale: nb });

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={`${label}: ${formatertDato}`}
      disabled={disabled}
    >
      <CalendarDays aria-hidden="true" />
      <span>{formatertDato}</span>
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
  const grenvalg: RecordControlGroup = {
    label: "Gren",
    options: [
      { value: "alle", label: "Alle grener" },
      ...grener.map((gren) => ({
        value: gren.id,
        label: `${gren.navn}${gren.aktiv ? "" : " (inaktiv)"}`,
      })),
    ],
    selectedValues: [filtre.grenId ?? "alle"],
    onToggle: (value) => onGrenChange(value === "alle" ? null : value),
  };

  const banevalg: RecordControlGroup | null = filtre.grenId
    ? {
        label: "Bane",
        options: [
          { value: "alle", label: "Alle baner" },
          ...baner.map((bane) => ({
            value: bane.id,
            label: `${bane.navn}${bane.aktiv ? "" : " (inaktiv)"}`,
          })),
        ],
        selectedValues: [filtre.baneId ?? "alle"],
        onToggle: (value) => onBaneChange(value === "alle" ? null : value),
      }
    : null;

  const fields: RecordControlField[] = [
    {
      id: "periode",
      label: "Periode",
      control: (
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
      ),
    },
    {
      id: "sammenligning",
      width: "wide",
      control: (
        <SwitchRow
          title="Sammenlign med året før"
          description="Bruker samme datoer ett år tidligere"
          checked={filtre.sammenlignMedForrigeÅr}
          onCheckedChange={onSammenligningChange}
          disabled={disabled}
        />
      ),
    },
  ];

  if (periodevalg === "egendefinert") {
    fields.push(
      {
        id: "fra",
        label: "Fra",
        control: (
          <DatePickerPopover value={isoTilDato(filtre.fra)} onChange={onFraChange} align="start">
            <Datoknapp label="Fra" dato={filtre.fra} disabled={disabled} />
          </DatePickerPopover>
        ),
      },
      {
        id: "til",
        label: "Til",
        control: (
          <DatePickerPopover
            value={isoTilDato(filtre.til)}
            onChange={onTilChange}
            minDate={isoTilDato(filtre.fra)}
            align="start"
          >
            <Datoknapp label="Til" dato={filtre.til} disabled={disabled} />
          </DatePickerPopover>
        ),
      }
    );
  }

  return (
    <RecordCollection ariaLabel="Statistikkfilter">
      <RecordCollectionHeader
        icon={<SlidersHorizontal aria-hidden="true" />}
        title="Visning"
        description="Velg periode og avgrens statistikken til en gren eller bane."
        selection={{
          label: "Gren- og banevalg",
          groups: banevalg ? [grenvalg, banevalg] : [grenvalg],
          disabled,
          indicator: "default",
        }}
        filter={{
          label: "Flere filtre",
          fields,
          disabled,
        }}
      />
    </RecordCollection>
  );
}
