import { useMemo, useState } from "react";
import { AlertCircle, CalendarCheck, CalendarX, Filter, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";
import { Accordion } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MinBookingRespons } from "@/types";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

import MineBookingRow from "./MineBookingRow";
import { buildBookingKey } from "./bookingSort";

type Props = {
  visHistoriske: boolean;
  onToggleVisHistoriske: (value: boolean) => void;
  bookinger: MinBookingRespons[];
  isLoading: boolean;
  queryError: string | null;
  isFetching: boolean;
  onRetry: () => void;
  isPending: boolean;
  onFjern: (booking: MinBookingRespons) => void;
  serverFeil: string | null;
};

type BookingGroup = {
  date: string;
  bookings: MinBookingRespons[];
};

function parseLocalDate(date: string) {
  return new Date(`${date.slice(0, 10)}T00:00:00`);
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("nb-NO") + value.slice(1);
}

function getDateHeading(date: string) {
  const parsed = parseLocalDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDifference = Math.round((parsed.getTime() - today.getTime()) / 86_400_000);
  const full = parsed.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    relative: dayDifference === 0 ? "I dag" : dayDifference === 1 ? "I morgen" : null,
    full: capitalize(full),
  };
}

function groupBookingsByDate(bookings: MinBookingRespons[]): BookingGroup[] {
  return bookings.reduce<BookingGroup[]>((groups, booking) => {
    const date = booking.dato.slice(0, 10);
    const currentGroup = groups.at(-1);

    if (currentGroup?.date === date) {
      currentGroup.bookings.push(booking);
    } else {
      groups.push({ date, bookings: [booking] });
    }

    return groups;
  }, []);
}

function BookingListSkeleton() {
  return (
    <div className="space-y-6" aria-label="Laster bookinger">
      {Array.from({ length: 2 }, (_, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="overflow-hidden rounded-2xl border bg-card">
            {Array.from({ length: 2 }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[1fr_auto] gap-4 border-b p-4 last:border-b-0 md:grid-cols-[10rem_1fr_auto]"
              >
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-5 w-20 md:order-3" />
                <Skeleton className="col-span-2 h-5 w-36 md:col-span-1 md:order-2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type EmptyStateProps = {
  filtered: boolean;
  historical: boolean;
  onReset: () => void;
};

function EmptyState({ filtered, historical, onReset }: EmptyStateProps) {
  const title = filtered
    ? "Ingen bookinger for valgt aktivitet"
    : historical
      ? "Ingen bookinger ennå"
      : "Ingen kommende bookinger";
  const description = filtered
    ? "Velg en annen aktivitet eller nullstill filteret."
    : historical
      ? "Når du booker en bane, vises kommende og gjennomførte tider her."
      : "Finn en ledig tid som passer, så dukker den opp her med en gang.";

  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CalendarX aria-hidden="true" className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-medium">{title}</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {filtered ? (
        <Button type="button" variant="outline" onClick={onReset}>
          Nullstill filter
        </Button>
      ) : (
        <Button asChild>
          <Link to="..">Book en bane</Link>
        </Button>
      )}
    </div>
  );
}

export default function MineBookingerContent({
  visHistoriske,
  onToggleVisHistoriske,
  bookinger,
  isLoading,
  queryError,
  isFetching,
  onRetry,
  isPending,
  onFjern,
  serverFeil,
}: Props) {
  const [grenFilter, setGrenFilter] = useState<string[]>([]);

  const grener = useMemo(
    () =>
      [
        ...new Map(
          bookinger.map((booking) => [
            booking.grenId,
            { value: booking.grenId, label: booking.grenNavn },
          ])
        ).values(),
      ].sort((a, b) => a.label.localeCompare(b.label, "nb-NO")),
    [bookinger]
  );

  const filtrerteBookinger = useMemo(() => {
    if (grenFilter.length === 0) return bookinger;
    return bookinger.filter((booking) => grenFilter.includes(booking.grenId));
  }, [bookinger, grenFilter]);

  function toggleGren(grenId: string) {
    setGrenFilter((current) =>
      current.includes(grenId)
        ? current.filter((currentGrenId) => currentGrenId !== grenId)
        : [...current, grenId]
    );
  }

  const {
    synlige: synligeBookinger,
    harFlere,
    gjenstaar,
    visFlere,
  } = usePagination(filtrerteBookinger, 10, `${String(visHistoriske)}|${grenFilter.join(",")}`);

  const antallTekst = isLoading
    ? "Laster bookinger…"
    : `${filtrerteBookinger.length} ${filtrerteBookinger.length === 1 ? "booking" : "bookinger"}`;
  const bookingGroups = groupBookingsByDate(synligeBookinger);
  const harFiltrertTomtilstand = bookinger.length > 0 && filtrerteBookinger.length === 0;

  return (
    <Card
      className="md:rounded-none md:py-0 md:ring-0"
      aria-busy={isLoading}
      aria-label="Oversikt over mine bookinger"
    >
      <CardHeader className="border-b md:pt-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarCheck aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <CardTitle>{antallTekst}</CardTitle>
            <CardDescription>
              {visHistoriske ? "Kommende og gjennomførte bookinger" : "Kommende bookinger"}
            </CardDescription>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={visHistoriske ? "alle" : "kommende"}
            onValueChange={(value) => onToggleVisHistoriske(value === "alle")}
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="kommende">Kommende</TabsTrigger>
              <TabsTrigger value="alle">Alle</TabsTrigger>
            </TabsList>
          </Tabs>

          {grener.length > 1 || grenFilter.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between sm:w-auto"
                  disabled={isFetching}
                >
                  <span className="inline-flex items-center gap-2">
                    <Filter aria-hidden="true" />
                    Aktivitet
                  </span>
                  {grenFilter.length > 0 ? (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {grenFilter.length}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrer på aktivitet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {grener.map((gren) => (
                  <DropdownMenuCheckboxItem
                    key={gren.value}
                    checked={grenFilter.includes(gren.value)}
                    onCheckedChange={() => toggleGren(gren.value)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {gren.label}
                  </DropdownMenuCheckboxItem>
                ))}
                {grenFilter.length > 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setGrenFilter([])}
                    >
                      Nullstill filter
                    </Button>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 md:pb-8">
        {serverFeil ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Kunne ikke avbestille</AlertTitle>
            <AlertDescription>{serverFeil}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <BookingListSkeleton />
        ) : queryError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <RefreshCw aria-hidden="true" className="size-6" />
            </span>
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-medium">Kunne ikke laste bookingene dine</h2>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">{queryError}</p>
            </div>
            <Button type="button" variant="outline" onClick={onRetry} disabled={isFetching}>
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          </div>
        ) : filtrerteBookinger.length === 0 ? (
          <EmptyState
            filtered={harFiltrertTomtilstand}
            historical={visHistoriske}
            onReset={() => setGrenFilter([])}
          />
        ) : (
          <>
            <div className="space-y-7" data-loading={isFetching || isPending}>
              {bookingGroups.map((group) => {
                const heading = getDateHeading(group.date);

                return (
                  <section key={group.date} className="space-y-3">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      {heading.relative ? (
                        <h2 className="font-heading text-base font-medium">{heading.relative}</h2>
                      ) : null}
                      <p className="text-sm text-muted-foreground">
                        <time dateTime={group.date}>{heading.full}</time>
                      </p>
                    </div>

                    <Accordion type="multiple" className="bg-card">
                      {group.bookings.map((booking) => (
                        <MineBookingRow
                          key={buildBookingKey(booking)}
                          bookingKey={buildBookingKey(booking)}
                          booking={booking}
                          canCancel={harHandling(
                            booking.kapabiliteter,
                            Kapabiliteter.booking.fjern
                          )}
                          isPending={isPending}
                          onCancel={onFjern}
                        />
                      ))}
                    </Accordion>
                  </section>
                );
              })}
            </div>

            {harFlere ? (
              <div className="flex justify-center border-t pt-6">
                <Button type="button" variant="outline" onClick={visFlere}>
                  Vis flere ({gjenstaar} gjenstår)
                </Button>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
