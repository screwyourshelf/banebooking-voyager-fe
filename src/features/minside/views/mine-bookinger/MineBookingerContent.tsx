import { CalendarCheck, CalendarX, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";
import {
  RecordCollection,
  RecordCollectionBody,
  RecordCollectionHeader,
  RecordCollectionPagination,
  RecordCollectionSkeleton,
  RecordList,
  RecordListState,
} from "@/components/records";
import { ServerFeil } from "@/components/errors";
import { Accordion } from "@/components/ui/accordion";
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
  const {
    synlige: synligeBookinger,
    harFlere,
    gjenstaar,
    visFlere,
  } = usePagination(bookinger, 10, visHistoriske);

  const antallTekst = isLoading
    ? "Laster tider…"
    : `${bookinger.length} ${bookinger.length === 1 ? "tid" : "tider"}`;
  const bookingGroups = groupBookingsByDate(synligeBookinger);

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
        ) : bookinger.length === 0 ? (
          <RecordListState
            icon={<CalendarX aria-hidden="true" />}
            title={visHistoriske ? "Ingen tider ennå" : "Ingen kommende tider"}
            description={
              visHistoriske
                ? "Når du booker en bane, vises kommende og tidligere tider her."
                : "Finn en ledig tid som passer, så dukker den opp her med en gang."
            }
            action={
              <Button asChild size="sm">
                <Link to="..">Book en bane</Link>
              </Button>
            }
          />
        ) : (
          <>
            <Accordion type="single" collapsible className="mine-bookings__groups">
              {bookingGroups.map((group) => {
                const heading = getDateHeading(group.date);

                return (
                  <section key={group.date} className="mine-bookings__date-group">
                    <h2 className="mine-bookings__date-heading">
                      {heading.relative ? <strong>{heading.relative}</strong> : null}
                      <time dateTime={group.date}>{heading.full}</time>
                    </h2>

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
                  </section>
                );
              })}
            </Accordion>

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
