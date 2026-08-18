import { useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

import {
  norskeKalenderEtiketter,
  norskKalenderLocale,
} from "@/components/controls/kalenderLokalisering";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { bookingPageStyles } from "@/styles/recipes";
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const shownDate = valgtDato ?? today;
  const isToday = isSameDay(shownDate, today);
  const isTomorrow = isSameDay(shownDate, tomorrow);
  const dateButtonLabel =
    isToday || isTomorrow ? "Velg dato" : format(shownDate, "d. MMM", { locale: nb });
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

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    onDatoChange(date);
    setCalendarOpen(false);
  }

  return (
    <Card className={bookingPageStyles.selectorCard}>
      <CardHeader className={bookingPageStyles.selectorHeader}>
        <CardTitle className={bookingPageStyles.selectorTitle}>
          <h2>{resultLabel}</h2>
        </CardTitle>
        <CardAction>
          <ReglementDialog gren={selectedActivity} bane={selectedCourt}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={bookingPageStyles.selectorRules}
              disabled={!selectedActivity || !selectedCourt}
            >
              Bookingregler
            </Button>
          </ReglementDialog>
        </CardAction>
      </CardHeader>

      <CardContent className={bookingPageStyles.selectorGrid}>
        <Field
          className={bookingPageStyles.selectorField}
          data-disabled={isSetupFetching || undefined}
        >
          <FieldLabel className={bookingPageStyles.selectorLabel}>Gren</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={valgtGrenId}
            onValueChange={(value) => {
              if (value) onGrenChange(value);
            }}
            aria-label="Velg gren"
            className={bookingPageStyles.selectorGroup}
          >
            {grener.map((gren) => (
              <ToggleGroupItem
                key={gren.id}
                value={gren.id}
                className={bookingPageStyles.selectorItem}
                disabled={isSetupFetching}
              >
                {gren.navn}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Field
          className={bookingPageStyles.selectorField}
          data-disabled={isSetupFetching || undefined}
        >
          <FieldLabel className={bookingPageStyles.selectorLabel}>Dag</FieldLabel>
          <div className={bookingPageStyles.selectorDayRow}>
            <ToggleGroup
              type="single"
              variant="outline"
              value={isToday ? "today" : isTomorrow ? "tomorrow" : ""}
              onValueChange={(value) => {
                if (value === "today") onDatoChange(today);
                if (value === "tomorrow") onDatoChange(tomorrow);
              }}
              aria-label="Velg dag"
              className={bookingPageStyles.selectorDayGroup}
            >
              <ToggleGroupItem
                value="today"
                className={bookingPageStyles.selectorItem}
                disabled={isSetupFetching}
              >
                I dag
              </ToggleGroupItem>
              <ToggleGroupItem
                value="tomorrow"
                className={bookingPageStyles.selectorItem}
                disabled={isSetupFetching}
              >
                I morgen
              </ToggleGroupItem>
            </ToggleGroup>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={bookingPageStyles.selectorDate}
                  disabled={isSetupFetching}
                  aria-label={`Velg dato, valgt ${format(shownDate, "EEEE d. MMMM", { locale: nb })}`}
                >
                  <CalendarDays aria-hidden="true" />
                  {dateButtonLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={shownDate}
                  defaultMonth={shownDate}
                  onSelect={handleDateSelect}
                  locale={norskKalenderLocale}
                  labels={norskeKalenderEtiketter}
                />
              </PopoverContent>
            </Popover>
          </div>
        </Field>

        <Field
          className={bookingPageStyles.selectorField}
          data-disabled={isSetupFetching || undefined}
        >
          <FieldLabel className={bookingPageStyles.selectorLabel}>Bane</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={valgtBaneId}
            onValueChange={(value) => {
              if (value) onBaneChange(value);
            }}
            aria-label="Velg bane"
            className={bookingPageStyles.selectorGroup}
          >
            {baner.map((bane) => (
              <ToggleGroupItem
                key={bane.id}
                value={bane.id}
                className={bookingPageStyles.selectorItem}
                disabled={isSetupFetching}
              >
                {bane.navn}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      </CardContent>
    </Card>
  );
}
