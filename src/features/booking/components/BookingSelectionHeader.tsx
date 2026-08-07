import { useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

import {
  norskeKalenderEtiketter,
  norskKalenderLocale,
} from "@/components/controls/kalenderLokalisering";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Card className="md:bg-card/95 md:backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">
          <h2>Velg bane og dag</h2>
        </CardTitle>
        <CardDescription>Endringer oppdaterer de tilgjengelige tidene automatisk.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[1fr_1.25fr_1fr]">
        <Field data-disabled={isSetupFetching || undefined}>
          <FieldLabel htmlFor="booking-activity">Aktivitet</FieldLabel>
          <Select
            value={valgtGrenId}
            onValueChange={onGrenChange}
            disabled={isSetupFetching || grener.length === 0}
          >
            <SelectTrigger id="booking-activity" className="w-full">
              <SelectValue placeholder="Velg aktivitet" />
            </SelectTrigger>
            <SelectContent>
              {grener.map((gren) => (
                <SelectItem key={gren.id} value={gren.id}>
                  {gren.navn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field data-disabled={isSetupFetching || undefined}>
          <FieldLabel>Dag</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={isSameDay(shownDate, today) ? "secondary" : "outline"}
              size="sm"
              onClick={() => onDatoChange(today)}
              disabled={isSetupFetching}
            >
              I dag
            </Button>
            <Button
              type="button"
              variant={isSameDay(shownDate, tomorrow) ? "secondary" : "outline"}
              size="sm"
              onClick={() => onDatoChange(tomorrow)}
              disabled={isSetupFetching}
            >
              I morgen
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="col-span-2 justify-start font-normal"
                  disabled={isSetupFetching}
                >
                  <CalendarDays aria-hidden="true" />
                  {format(shownDate, "EEEE d. MMMM", { locale: nb })}
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

        <Field data-disabled={isSetupFetching || undefined}>
          <FieldLabel htmlFor="booking-court">Bane</FieldLabel>
          <Select
            value={valgtBaneId}
            onValueChange={onBaneChange}
            disabled={isSetupFetching || baner.length === 0}
          >
            <SelectTrigger id="booking-court" className="w-full">
              <SelectValue placeholder="Velg bane" />
            </SelectTrigger>
            <SelectContent>
              {baner.map((bane) => (
                <SelectItem key={bane.id} value={bane.id}>
                  {bane.navn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-3 border-t">
        <Badge variant={hasError ? "destructive" : "secondary"}>{resultLabel}</Badge>
        <ReglementDialog gren={selectedActivity} bane={selectedCourt}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!selectedActivity || !selectedCourt}
          >
            Bookingregler
          </Button>
        </ReglementDialog>
      </CardFooter>
    </Card>
  );
}
