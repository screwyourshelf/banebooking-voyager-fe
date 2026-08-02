import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";

import ControlChoice from "@/components/controls/ControlChoice";
import DatePickerPopover from "@/components/controls/DatePickerPopover";
import {
  RecordCollectionHeader,
  RecordContextAction,
  type RecordControlGroup,
} from "@/components/records";
import type { BaneRespons, GrenRespons } from "@/types";
import ReglementDialog from "./ReglementDialog";

type Props = {
  grener: GrenRespons[];
  valgtGrenId: string;
  onGrenChange: (grenId: string) => void;
  baner: BaneRespons[];
  valgtBaneId: string;
  onBaneChange: (baneId: string) => void;
  valgtDato: Date | null;
  onDatoChange: (dato: Date | null) => void;
  ledigeAntall: number;
  isLoading: boolean;
  isFetching: boolean;
  isSetupFetching: boolean;
  hasError: boolean;
};

export default function BookingSelectionHeader({
  grener,
  valgtGrenId,
  onGrenChange,
  baner,
  valgtBaneId,
  onBaneChange,
  valgtDato,
  onDatoChange,
  ledigeAntall,
  isLoading,
  isFetching,
  isSetupFetching,
  hasError,
}: Props) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const shownDate = valgtDato ?? today;
  const isToday = isSameDay(shownDate, today);
  const isTomorrow = isSameDay(shownDate, tomorrow);
  const isCustomDate = !isToday && !isTomorrow;
  const selectedDateValue = isToday ? "today" : isTomorrow ? "tomorrow" : "custom";
  const selectedActivity = grener.find((gren) => gren.id === valgtGrenId);
  const selectedCourt = baner.find((bane) => bane.id === valgtBaneId);
  const customDateLabel = isCustomDate ? format(shownDate, "d. MMM", { locale: nb }) : "Velg dato";
  const customDateAriaLabel = isCustomDate
    ? `Velg dato. Viser ${format(shownDate, "d. MMMM", { locale: nb })}`
    : "Velg en annen dato";

  const groups: RecordControlGroup[] = [
    {
      label: "Gren",
      options: grener.map((gren) => ({ value: gren.id, label: gren.navn })),
      selectedValues: valgtGrenId ? [valgtGrenId] : [],
      onToggle: onGrenChange,
    },
    {
      label: "Dag",
      options: [
        { value: "today", label: "I dag" },
        { value: "tomorrow", label: "I morgen" },
        {
          value: "custom",
          label: customDateLabel,
          renderControl: ({ selected, disabled }) => (
            <DatePickerPopover value={valgtDato} onChange={onDatoChange} align="end">
              <ControlChoice
                selected={selected}
                disabled={disabled}
                aria-label={customDateAriaLabel}
              >
                {customDateLabel}
              </ControlChoice>
            </DatePickerPopover>
          ),
        },
      ],
      selectedValues: [selectedDateValue],
      onToggle: (value) => {
        if (value === "today") onDatoChange(today);
        if (value === "tomorrow") onDatoChange(tomorrow);
      },
    },
    ...(baner.length > 1
      ? [
          {
            label: "Bane",
            options: baner.map((bane) => ({ value: bane.id, label: bane.navn })),
            selectedValues: valgtBaneId ? [valgtBaneId] : [],
            onToggle: onBaneChange,
          } satisfies RecordControlGroup,
        ]
      : []),
  ];

  const title =
    isLoading || isFetching
      ? "Laster tider…"
      : hasError
        ? "Tider utilgjengelige"
        : ledigeAntall === 0
          ? "Ingen ledige tider"
          : `${ledigeAntall} ${ledigeAntall === 1 ? "ledig tid" : "ledige tider"}`;
  return (
    <RecordCollectionHeader
      icon={<CalendarCheck />}
      title={title}
      contextAction={
        <ReglementDialog gren={selectedActivity} bane={selectedCourt}>
          <RecordContextAction
            type="button"
            aria-label="Regler for valgt bane"
            disabled={!selectedActivity || !selectedCourt}
          >
            Bookingregler
          </RecordContextAction>
        </ReglementDialog>
      }
      selection={{
        label: "Bookingvalg",
        groups,
        disabled: isSetupFetching,
        indicator: "activity",
      }}
    />
  );
}
