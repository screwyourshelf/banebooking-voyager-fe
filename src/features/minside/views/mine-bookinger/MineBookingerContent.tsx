import { useMemo, useState } from "react";
import { AlertCircle, CalendarCheck, CalendarX, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import {
  RecordCollection,
  RecordCollectionBody,
  RecordCollectionHeader,
  RecordCollectionPagination,
  RecordCollectionSkeleton,
  RecordDateGroup,
  RecordDateGroupHeading,
  RecordDateGroupList,
  RecordListState,
  type RecordControlGroup,
} from "@/components/records";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
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
    ? "Laster bookinger…"
    : `${filtrerteBookinger.length} ${filtrerteBookinger.length === 1 ? "booking" : "bookinger"}`;
  const bookingGroups = groupBookingsByDate(synligeBookinger);
  const harFiltrertTomtilstand = bookinger.length > 0 && filtrerteBookinger.length === 0;
  const selectionGroups: RecordControlGroup[] = [
    {
      label: "Periode",
      options: [
        { value: "kommende", label: "Kommende" },
        { value: "alle", label: "Alle" },
      ],
      selectedValues: [visHistoriske ? "alle" : "kommende"],
      onToggle: (value) => onToggleVisHistoriske(value === "alle"),
    },
    ...(grener.length > 1
      ? [
          {
            label: "Gren",
            options: grener,
            selectedValues: grenFilter,
            onToggle: toggleGren,
          },
        ]
      : []),
  ];

  return (
    <RecordCollection ariaLabel="Oversikt over mine bookinger" busy={isLoading || isFetching}>
      <RecordCollectionHeader
        icon={<CalendarCheck />}
        title={antallTekst}
        summaryStatus={visHistoriske ? "Kommende og gjennomførte" : "Kommende"}
        selection={{
          label: "Filtrer bookinger",
          groups: selectionGroups,
          disabled: isFetching,
        }}
      />

      <RecordCollectionBody>
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
          <RecordDateGroupList loading={isFetching || isPending}>
            {bookingGroups.map((group) => {
              const heading = getDateHeading(group.date);

              return (
                <RecordDateGroup key={group.date}>
                  <RecordDateGroupHeading
                    date={group.date}
                    label={heading.full}
                    relativeLabel={heading.relative}
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
                </RecordDateGroup>
              );
            })}
          </RecordDateGroupList>
        )}
      </RecordCollectionBody>

      {harFlere ? (
        <RecordCollectionPagination>
          <Button type="button" variant="outline" onClick={visFlere}>
            Vis flere ({gjenstaar} gjenstår)
          </Button>
        </RecordCollectionPagination>
      ) : null}
    </RecordCollection>
  );
}
