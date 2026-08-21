import { useMemo, useState } from "react";
import { AlertCircle, CalendarCheck, CalendarX, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import {
  RecordCollectionPagination,
  RecordCollectionSkeleton,
  RecordListState,
} from "@/components/records";
import { Collection } from "@/components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import type { MinBookingRespons } from "@/types";
import { formaterDatoGruppe } from "@/utils/datoUtils";
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
    <Collection
      icon={<CalendarCheck />}
      title={antallTekst}
      scope="Dine reservasjoner"
      busy={isLoading || isFetching}
      toggle={{
        title: "Vis tidligere",
        checked: visHistoriske,
        onCheckedChange: onToggleVisHistoriske,
        disabled: isFetching,
      }}
      filter={
        grener.length > 1
          ? {
              label: "Filtrer bookinger",
              groups: [
                {
                  label: "Gren",
                  options: grener,
                  selectedValues: grenFilter,
                  onToggle: toggleGren,
                },
              ],
              onReset: () => setGrenFilter([]),
              disabled: isFetching,
            }
          : undefined
      }
    >
      {serverFeil ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Kunne ikke avbestille</AlertTitle>
          <AlertDescription>{serverFeil}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <RecordCollectionSkeleton ariaLabel="Laster bookinger" rows={3} layout="date" />
      ) : queryError ? (
        <RecordListState
          icon={<RefreshCw aria-hidden="true" />}
          title="Kunne ikke laste bookingene dine"
          description={queryError}
          tone="danger"
          role="alert"
          action={
            <Button type="button" variant="outline" onClick={onRetry} disabled={isFetching}>
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          }
        />
      ) : filtrerteBookinger.length === 0 ? (
        <RecordListState
          icon={<CalendarX aria-hidden="true" />}
          title={
            harFiltrertTomtilstand
              ? "Ingen bookinger for valgt gren"
              : visHistoriske
                ? "Ingen bookinger ennå"
                : "Ingen kommende bookinger"
          }
          description={
            harFiltrertTomtilstand
              ? "Velg en annen gren eller nullstill filteret."
              : visHistoriske
                ? "Når du booker en bane, vises kommende og gjennomførte tider her."
                : "Finn en ledig tid som passer, så dukker den opp her med en gang."
          }
          action={
            harFiltrertTomtilstand ? (
              <Button type="button" variant="outline" onClick={() => setGrenFilter([])}>
                Nullstill filter
              </Button>
            ) : (
              <Button asChild>
                <Link to="..">Book en bane</Link>
              </Button>
            )
          }
        />
      ) : (
        <Collection.List loading={isFetching || isPending}>
          {bookingGroups.map((group) => {
            const heading = formaterDatoGruppe(group.date);

            return (
              <Collection.Group key={group.date}>
                <Collection.GroupHeading
                  date={group.date}
                  label={heading.label}
                  relativeLabel={heading.relativeLabel}
                />
                {group.bookings.map((booking) => (
                  <MineBookingRow
                    key={buildBookingKey(booking)}
                    bookingKey={buildBookingKey(booking)}
                    booking={booking}
                    canCancel={harHandling(booking.kapabiliteter, Kapabiliteter.booking.fjern)}
                    isPending={isPending}
                    onCancel={onFjern}
                  />
                ))}
              </Collection.Group>
            );
          })}
        </Collection.List>
      )}

      {harFlere ? (
        <RecordCollectionPagination>
          <Button type="button" variant="outline" onClick={visFlere}>
            Vis flere ({gjenstaar} gjenstår)
          </Button>
        </RecordCollectionPagination>
      ) : null}
    </Collection>
  );
}
