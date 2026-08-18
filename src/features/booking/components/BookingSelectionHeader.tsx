import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

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
  const selectedActivity = grener.find((gren) => gren.id === valgtGrenId);
  const selectedCourt = baner.find((bane) => bane.id === valgtBaneId);
  const resultLabel =
    isLoading || isFetching
      ? "Laster tider…"
      : hasError
        ? "Tider utilgjengelige"
        : ledigeAntall === 0
          ? "Ingen ledige tider"
          : `${ledigeAntall} ${ledigeAntall === 1 ? "ledig tid" : "ledige tider"}`;
  const selectedDateValue = isToday ? "today" : isTomorrow ? "tomorrow" : "date";
  const dateButtonLabel =
    isToday || isTomorrow ? "Velg dato" : format(shownDate, "d. MMM", { locale: nb });

  const selectionGroups: RecordControlGroup[] = [
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
          value: "date",
          label: dateButtonLabel,
          renderControl: ({ selected, disabled }) => (
            <DatePickerPopover
              value={shownDate}
              onChange={onDatoChange}
              minDate={today}
              align="start"
            >
              <ControlChoice
                selected={selected}
                disabled={disabled}
                aria-label={`Velg dato, valgt ${format(shownDate, "EEEE d. MMMM", { locale: nb })}`}
              >
                <CalendarDays aria-hidden="true" />
                {dateButtonLabel}
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
    {
      label: "Bane",
      options: baner.map((bane) => ({ value: bane.id, label: bane.navn })),
      selectedValues: valgtBaneId ? [valgtBaneId] : [],
      onToggle: onBaneChange,
    },
  ];

  return (
    <RecordCollectionHeader
      icon={<CalendarDays />}
      title={resultLabel}
      summaryStatus={
        selectedCourt
          ? `${selectedCourt.navn}${selectedActivity ? ` · ${selectedActivity.navn}` : ""}`
          : "Velg en bane for å se tider"
      }
      contextAction={
        <ReglementDialog gren={selectedActivity} bane={selectedCourt}>
          <RecordContextAction disabled={!selectedActivity || !selectedCourt}>
            Bookingregler
          </RecordContextAction>
        </ReglementDialog>
      }
      selection={{
        label: "Velg gren, dag og bane",
        groups: selectionGroups,
        disabled: isSetupFetching,
      }}
    />
  );
}
