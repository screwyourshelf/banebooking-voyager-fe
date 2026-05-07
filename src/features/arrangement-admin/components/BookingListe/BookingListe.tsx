import { useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { LokalBooking } from "../../types";
import { sorterBookinger, tellKonflikter } from "./bookingListeUtils";
import BookingRad from "./BookingRad";

type Props = {
  bookinger: LokalBooking[];
  onRediger: (id: string) => void;
  onFjernEllerAvlys: (id: string) => void;
  onLeggTilFlere?: () => void;
};

export default function BookingListe({
  bookinger,
  onRediger,
  onFjernEllerAvlys,
  onLeggTilFlere,
}: Props) {
  const sorterte = useMemo(() => sorterBookinger(bookinger), [bookinger]);
  const antallKonflikter = useMemo(() => tellKonflikter(bookinger), [bookinger]);
  const antallAktive = bookinger.filter((b) => !b.erSlettet && b.kilde === "eksisterende").length;
  const antallForslag = bookinger.filter((b) => !b.erSlettet && b.kilde !== "eksisterende").length;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Booking-liste{" "}
          <span className="text-muted-foreground font-normal">
            (
            {antallAktive > 0 && (
              <span>{antallAktive} aktiv{antallAktive !== 1 ? "e" : ""}</span>
            )}
            {antallAktive > 0 && antallForslag > 0 && <span> · </span>}
            {antallForslag > 0 && (
              <span className="text-blue-600 dark:text-blue-400">
                {antallForslag} forslag
              </span>
            )}
            {antallAktive === 0 && antallForslag === 0 && <span>tom</span>}
            {antallKonflikter > 0 && (
              <span className="text-amber-600 ml-1">
                · {antallKonflikter} konflikt{antallKonflikter !== 1 ? "er" : ""}
              </span>
            )}
            )
          </span>
        </h3>
      </div>

      {/* Tabell */}
      <div className="rounded-md border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dato</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Tid</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Bane</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {sorterte.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Ingen bookinger lagt til ennå.
                </td>
              </tr>
            ) : (
              sorterte.map((booking) => (
                <BookingRad
                  key={booking.id}
                  booking={booking}
                  onRediger={onRediger}
                  onFjernEllerAvlys={onFjernEllerAvlys}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Handlinger under tabellen */}
      {onLeggTilFlere && (
        <Button type="button" variant="outline" size="sm" onClick={onLeggTilFlere}>
          <PlusCircle className="size-4 mr-1.5" />
          Legg til flere
        </Button>
      )}
    </div>
  );
}
