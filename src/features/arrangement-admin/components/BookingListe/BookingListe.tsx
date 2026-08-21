import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Collection } from "@/components";

import { RecordListState } from "@/components/records";
import type { LokalBooking } from "../../types";
import {
  grupperBookingerEtterDato,
  kanBookingOpprettes,
  sorterBookinger,
  tellKonflikter,
} from "./bookingListeUtils";
import BookingRad from "./BookingRad";
import { formaterAntallBanetider } from "@/utils/arrangementPresentation";
import { formaterDatoGruppe } from "@/utils/datoUtils";

type Props = {
  bookinger: LokalBooking[];
  onRediger: (id: string) => void;
};

export default function BookingListe({ bookinger, onRediger }: Props) {
  const [valgteStatuser, setValgteStatuser] = useState<string[]>([]);
  const sorterte = useMemo(() => sorterBookinger(bookinger), [bookinger]);
  const antallKonflikter = useMemo(() => tellKonflikter(bookinger), [bookinger]);
  const antallAktive = bookinger.filter((booking) => !booking.erSlettet).length;
  const antallEksisterende = bookinger.filter(
    (booking) => !booking.erSlettet && booking.kilde === "eksisterende"
  ).length;
  const antallForslag = bookinger.filter(
    (booking) => booking.kilde !== "eksisterende" && kanBookingOpprettes(booking)
  ).length;
  const visKunKonflikter = valgteStatuser.includes("konflikt");
  const synligeBookinger = visKunKonflikter
    ? sorterte.filter((booking) => !booking.erSlettet && booking.status === "konflikt")
    : sorterte;
  const grupper = grupperBookingerEtterDato(synligeBookinger);

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
    <Collection
      icon={<CalendarClock aria-hidden="true" />}
      title={formaterAntallBanetider(visKunKonflikter ? synligeBookinger.length : antallAktive)}
      scope={summary || "Ingen tider er lagt til ennå."}
      filter={
        antallKonflikter > 0
          ? {
              label: "Filtrer banetider",
              groups: [
                {
                  label: "Status",
                  options: [{ value: "konflikt", label: "Konflikter" }],
                  selectedValues: valgteStatuser,
                  onToggle: (value) =>
                    setValgteStatuser((current) =>
                      current.includes(value)
                        ? current.filter((status) => status !== value)
                        : [...current, value]
                    ),
                },
              ],
              onReset: () => setValgteStatuser([]),
            }
          : undefined
      }
    >
      {synligeBookinger.length === 0 ? (
        <RecordListState
          title={visKunKonflikter ? "Ingen konflikter" : "Ingen banetider ennå"}
          description={
            visKunKonflikter
              ? "Alle forslagene kan opprettes."
              : "Bruk oppsettet over for å legge til konkrete tider."
          }
        />
      ) : (
        <Collection.List>
          {grupper.map((gruppe) => {
            const heading = formaterDatoGruppe(gruppe.dato);

            return (
              <Collection.Group key={gruppe.dato}>
                <Collection.GroupHeading
                  date={gruppe.dato}
                  label={heading.label}
                  relativeLabel={heading.relativeLabel}
                />
                {gruppe.bookinger.map((booking) => (
                  <BookingRad key={booking.id} booking={booking} onRediger={onRediger} />
                ))}
              </Collection.Group>
            );
          })}
        </Collection.List>
      )}
    </Collection>
  );
}
