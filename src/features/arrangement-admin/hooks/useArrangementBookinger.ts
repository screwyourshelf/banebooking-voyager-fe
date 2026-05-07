import { useMemo } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";

import type { ArrangementBookingRespons } from "@/types";
import type { LokalBooking } from "../types";

/**
 * Henter individuelle bookinger for ett arrangement fra
 * GET /api/klubb/{slug}/arrangement/{id}/bookinger
 *
 * Returnerer bookingene mappet til LokalBooking[]:
 * - kilde = "eksisterende"
 * - eksternId satt til backend bookingId
 * - status = "aktiv"
 * - opprinneligBookingNøkkel settes IKKE her – settes kun ved lokal redigering
 */
export function useArrangementBookinger(arrangementId: string | null) {
  const slug = useSlug();

  const { data, isLoading, error } = useApiQuery<ArrangementBookingRespons[]>(
    ["arrangement-bookinger", slug, arrangementId ?? ""],
    `/klubb/${slug}/arrangement/${arrangementId}/bookinger`,
    {
      requireAuth: true,
      enabled: !!arrangementId,
      staleTime: 30_000,
    }
  );

  const bookinger: LokalBooking[] = useMemo(
    () =>
      (data ?? []).map((b) => ({
        id: `eksisterende-${b.bookingId}`,
        eksternId: b.bookingId,
        dato: b.dato,
        startTid: b.startTid,
        sluttTid: b.sluttTid,
        baneId: b.baneId,
        baneNavn: b.baneNavn,
        status: "aktiv" as const,
        kilde: "eksisterende" as const,
      })),
    [data]
  );

  return { bookinger, isLoading, feil: error };
}
