import { useMemo, useState } from "react";
import { CalendarCheck, CalendarX, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";
import {
  RecordCollection,
  RecordCollectionBody,
  RecordCollectionHeader,
  RecordCollectionPagination,
  RecordCollectionSkeleton,
  RecordDateGroup,
  RecordDateGroupHeading,
  RecordDateGroupList,
  RecordList,
  RecordListState,
} from "@/components/records";
import { ServerFeil } from "@/components/errors";
import { Button } from "@/components/ui/button";
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
    ? "Laster tider…"
    : `${filtrerteBookinger.length} ${filtrerteBookinger.length === 1 ? "tid" : "tider"}`;
  const bookingGroups = groupBookingsByDate(synligeBookinger);
  const harFiltrertTomtilstand = bookinger.length > 0 && filtrerteBookinger.length === 0;

  return (
    <RecordCollection ariaLabel="Oversikt over mine tider" busy={isLoading}>
      <RecordCollectionHeader
        icon={<CalendarCheck />}
        title={antallTekst}
        description={visHistoriske ? "Kommende og tidligere tider" : "Kommende tider"}
        toggle={{
          title: "Vis tidligere",
          checked: visHistoriske,
          onCheckedChange: onToggleVisHistoriske,
          disabled: isFetching,
        }}
        filter={
          grener.length > 1 || grenFilter.length > 0
            ? {
                label: "Filtrer på gren",
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
      />

      <RecordCollectionBody>
        <ServerFeil feil={serverFeil} />

        {isLoading ? (
          <RecordCollectionSkeleton ariaLabel="Laster tider" rows={4} />
        ) : queryError ? (
          <RecordListState
            icon={<RefreshCw aria-hidden="true" />}
            title="Kunne ikke laste tidene dine"
            description={queryError}
            tone="danger"
            role="alert"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isFetching}
              >
                {isFetching ? "Prøver igjen…" : "Prøv igjen"}
              </Button>
            }
          />
        ) : filtrerteBookinger.length === 0 ? (
          <RecordListState
            icon={<CalendarX aria-hidden="true" />}
            title={
              harFiltrertTomtilstand
                ? "Ingen tider for valgt gren"
                : visHistoriske
                  ? "Ingen tider ennå"
                  : "Ingen kommende tider"
            }
            description={
              harFiltrertTomtilstand
                ? "Velg en annen gren eller nullstill filteret."
                : visHistoriske
                  ? "Når du booker en bane, vises kommende og tidligere tider her."
                  : "Finn en ledig tid som passer, så dukker den opp her med en gang."
            }
            action={
              harFiltrertTomtilstand ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setGrenFilter([])}>
                  Nullstill filter
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="..">Book en bane</Link>
                </Button>
              )
            }
          />
        ) : (
          <>
            <RecordDateGroupList>
              {bookingGroups.map((group) => {
                const heading = getDateHeading(group.date);

                return (
                  <RecordDateGroup key={group.date}>
                    <RecordDateGroupHeading
                      date={group.date}
                      label={heading.full}
                      relativeLabel={heading.relative}
                    />

                    <RecordList loading={isFetching || isPending}>
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
                    </RecordList>
                  </RecordDateGroup>
                );
              })}
            </RecordDateGroupList>

            {harFlere ? (
              <RecordCollectionPagination>
                <Button type="button" variant="outline" size="sm" onClick={visFlere}>
                  Vis flere ({gjenstaar} gjenstår)
                </Button>
              </RecordCollectionPagination>
            ) : null}
          </>
        )}
      </RecordCollectionBody>
    </RecordCollection>
  );
}
