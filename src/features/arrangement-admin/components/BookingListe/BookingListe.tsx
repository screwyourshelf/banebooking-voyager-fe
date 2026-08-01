import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { AdminEntityCollection, AdminEntityList } from "@/components/admin";
import { RecordListState } from "@/components/records";
import type { LokalBooking } from "../../types";
import { sorterBookinger, tellKonflikter } from "./bookingListeUtils";
import BookingRad from "./BookingRad";

type Props = {
  bookinger: LokalBooking[];
  onRediger: (id: string) => void;
  onFjernEllerAvlys: (id: string) => void;
};

export default function BookingListe({ bookinger, onRediger, onFjernEllerAvlys }: Props) {
  const sorterte = useMemo(() => sorterBookinger(bookinger), [bookinger]);
  const antallKonflikter = useMemo(() => tellKonflikter(bookinger), [bookinger]);
  const antallAktive = bookinger.filter((booking) => !booking.erSlettet).length;
  const antallEksisterende = bookinger.filter(
    (booking) => !booking.erSlettet && booking.kilde === "eksisterende"
  ).length;
  const antallForslag = bookinger.filter(
    (booking) => !booking.erSlettet && booking.kilde !== "eksisterende"
  ).length;

  const summary = [
    antallEksisterende > 0
      ? `${antallEksisterende} aktiv${antallEksisterende === 1 ? "" : "e"}`
      : null,
    antallForslag > 0 ? `${antallForslag} forslag` : null,
    antallKonflikter > 0
      ? `${antallKonflikter} konflikt${antallKonflikter === 1 ? "" : "er"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <AdminEntityCollection
      icon={<CalendarClock aria-hidden="true" />}
      title={`${antallAktive} booking${antallAktive === 1 ? "" : "er"}`}
      description={summary || "Ingen tider er lagt til ennå."}
    >
      {sorterte.length === 0 ? (
        <RecordListState
          title="Bookinglisten er tom"
          description="Bruk oppsettet over for å legge til konkrete tider."
        />
      ) : (
        <AdminEntityList>
          {sorterte.map((booking) => (
            <BookingRad
              key={booking.id}
              booking={booking}
              onRediger={onRediger}
              onFjernEllerAvlys={onFjernEllerAvlys}
            />
          ))}
        </AdminEntityList>
      )}
    </AdminEntityCollection>
  );
}
