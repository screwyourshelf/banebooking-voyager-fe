import { useCallback, useState } from "react";
import type { LokalBooking } from "../types";
import { lagBookingNøkkel } from "../components/BookingListe/bookingListeUtils";

export type BookingListeHandlinger = {
  bookinger: LokalBooking[];
  leggTil: (nye: LokalBooking[]) => void;
  fjern: (id: string) => void;
  markerSlettet: (id: string) => void;
  oppdater: (id: string, endringer: Partial<Omit<LokalBooking, "id">>) => void;
  settAlle: (bookinger: LokalBooking[]) => void;
  nullstill: () => void;
};

/**
 * Holder lokal state for BookingListe.
 *
 * - leggTil: legger til bookinger, deduplicerer på bookingNøkkel (dato_startTid_sluttTid_baneId)
 * - fjern: fjerner booking fra listen (brukes for nye/genererte – kilde !== "eksisterende")
 * - markerSlettet: markerer eksisterende booking for avlysning (beholdes i liste med erSlettet)
 * - oppdater: patcher én booking med nye verdier
 * - settAlle: erstatter hele listen (brukes ved lasting av eksisterende arrangement eller etter konfliktsjekk)
 * - nullstill: tømmer listen
 */
export function useBookingListe(): BookingListeHandlinger {
  const [bookinger, setBookinger] = useState<LokalBooking[]>([]);

  const leggTil = useCallback((nye: LokalBooking[]) => {
    setBookinger((prev) => {
      const eksisterendeNøkler = new Set(prev.map(lagBookingNøkkel));
      const unikNye = nye.filter((b) => !eksisterendeNøkler.has(lagBookingNøkkel(b)));
      return [...prev, ...unikNye];
    });
  }, []);

  const fjern = useCallback((id: string) => {
    setBookinger((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const markerSlettet = useCallback((id: string) => {
    setBookinger((prev) =>
      prev.map((b) => (b.id === id ? { ...b, erSlettet: true, status: "slettet" } : b))
    );
  }, []);

  const oppdater = useCallback((id: string, endringer: Partial<Omit<LokalBooking, "id">>) => {
    setBookinger((prev) => prev.map((b) => (b.id === id ? { ...b, ...endringer } : b)));
  }, []);

  const settAlle = useCallback((neste: LokalBooking[]) => {
    setBookinger(neste);
  }, []);

  const nullstill = useCallback(() => {
    setBookinger([]);
  }, []);

  return { bookinger, leggTil, fjern, markerSlettet, oppdater, settAlle, nullstill };
}
