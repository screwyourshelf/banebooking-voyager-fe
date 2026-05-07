import { useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

import type {
  ArrangementForhåndsvisningRespons,
  OpprettArrangementForespørsel,
} from "@/types";
import type { LokalBooking } from "../types";
import { lagBookingNøkkel } from "../components/BookingListe/bookingListeUtils";

type KonfliktSjekkResultat = {
  oppdaterteBookinger: LokalBooking[];
  antallKonflikter: number;
};

/**
 * Merger konfliktsjekk-resultat fra backend inn i en LokalBooking[]-liste.
 *
 * Bruker lagBookingNøkkel (dato_startTid_sluttTid_baneId) for matching – samme
 * funksjon som deduplisering og sortering for å garantere konsistens.
 * Alle andre felter (erEndret, erSlettet, kilde, eksternId osv.) bevares via spread.
 * API-et er kun brukt til å enriche status – aldri som source of truth for listen.
 */
export function mergeKonfliktStatus(
  bookinger: LokalBooking[],
  svar: ArrangementForhåndsvisningRespons
): LokalBooking[] {
  const konfliktNøkler = new Set(svar.konflikter.map((s) => lagBookingNøkkel(s)));
  const ledigeNøkler = new Set(svar.ledige.map((s) => lagBookingNøkkel(s)));

  return bookinger.map((b) => {
    // Bevar erSlettet-bookinger uendret
    if (b.erSlettet) return b;

    const nøkkel = lagBookingNøkkel(b);

    if (konfliktNøkler.has(nøkkel)) {
      return { ...b, status: "konflikt" };
    }

    if (ledigeNøkler.has(nøkkel)) {
      return { ...b, status: "ledig", konfliktInfo: undefined };
    }

    // Ikke matchet av backend: behold nåværende status
    return b;
  });
}

type ReturnType = {
  sjekkKonflikter: (
    bookinger: LokalBooking[],
    dto: OpprettArrangementForespørsel
  ) => Promise<KonfliktSjekkResultat | null>;
  isLoading: boolean;
  feil: Error | null;
};

/**
 * Hook for å sjekke konflikter mot backend og merge status tilbake i BookingListe.
 * Brukes etter at `GjentakendeOppsett` eller `ManueltOppsett` har generert bookinger.
 */
export function useKonfliktSjekk(): ReturnType {
  const slug = useSlug();
  const [feil, setFeil] = useState<Error | null>(null);

  const mutation = useApiMutation<
    OpprettArrangementForespørsel,
    ArrangementForhåndsvisningRespons
  >("post", `/klubb/${slug}/arrangement/forhandsvis`, { retry: false });

  const sjekkKonflikter = async (
    bookinger: LokalBooking[],
    dto: OpprettArrangementForespørsel
  ): Promise<KonfliktSjekkResultat | null> => {
    setFeil(null);
    try {
      const svar = await mutation.mutateAsync(dto);
      const oppdatertListe = mergeKonfliktStatus(bookinger, svar);
      const antallKonflikter = oppdatertListe.filter((b) => b.status === "konflikt").length;
      return { oppdaterteBookinger: oppdatertListe, antallKonflikter };
    } catch (e) {
      setFeil(e instanceof Error ? e : new Error("Konfliktsjekk feilet"));
      return null;
    }
  };

  return {
    sjekkKonflikter,
    isLoading: mutation.isPending,
    feil,
  };
}
