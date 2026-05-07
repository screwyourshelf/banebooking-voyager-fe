import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import api from "@/api/api";

import type {
  LeggTilArrangementBookingForespørsel,
  ArrangementBookingRespons,
  BatchLeggTilArrangementBookingerForespørsel,
  BatchLeggTilArrangementBookingerRespons,
} from "@/types";

export type BatchLeggTilResultat = {
  /** Bookinger som ble opprettet OK. */
  suksess: string[]; // lokale id-er
  /** Bookinger som feilet – skal forbli i staging med feilmelding. */
  feilet: Array<{ lokalId: string; feilmelding: string }>;
};

/**
 * Kaller POST /api/klubb/{slug}/arrangement/{arrangementId}/bookinger (enkelt)
 * og POST /api/klubb/{slug}/arrangement/{arrangementId}/bookinger/batch (bulk).
 *
 * Tilbyr to operasjoner:
 *  - leggTilBooking: enkelt kall med suksess-toast + re-fetch (manuelt oppsett)
 *  - batchLeggTil:   ett batch-kall, returnerer detaljert {suksess, feilet}.
 */
export function useLeggTilArrangementBooking(arrangementId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidere = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["arrangement-bookinger", slug, arrangementId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["arrangementer-admin", slug],
      }),
    ]);

  // Enkelt-mutasjon med toast – brukes av manuelt oppsett
  const mutation = useApiMutation<
    LeggTilArrangementBookingForespørsel,
    ArrangementBookingRespons
  >(
    "post",
    `/klubb/${slug}/arrangement/${arrangementId}/bookinger`,
    {
      onSuccess: async () => {
        toast.success("Booking opprettet.");
        await invalidere();
      },
      retry: false,
    }
  );

  /** Enkelt kall – toast ved suksess, kaster ved feil. */
  const leggTilBooking = (forespørsel: LeggTilArrangementBookingForespørsel) =>
    mutation.mutateAsync(forespørsel);

  /**
   * Batch-kall – ett enkelt POST til /bookinger/batch.
   * Returnerer detaljert resultat med suksess og feil per booking.
   * Invaliderer cachen etter kallet.
   *
   * @param bookinger  Array av { lokalId, forespørsel } – lokalId brukes til
   *                   å identifisere hvilke forslag som feilet i staging.
   */
  const batchLeggTil = async (
    bookinger: Array<{ lokalId: string; forespørsel: LeggTilArrangementBookingForespørsel }>
  ): Promise<BatchLeggTilResultat> => {
    const forespørsel: BatchLeggTilArrangementBookingerForespørsel = {
      bookinger: bookinger.map((b) => b.forespørsel),
    };

    try {
      const respons = await api.post<BatchLeggTilArrangementBookingerRespons>(
        `/klubb/${slug}/arrangement/${arrangementId}/bookinger/batch`,
        forespørsel,
        { requireAuth: true }
      );
      const data = respons.data;

      // Match opprettede bookinger tilbake til lokalId via posisjon.
      // Backend returnerer opprettede i samme rekkefølge som input minus feilede.
      // Vi identifiserer feilede via dato+tid+bane-kombinasjon.
      const feiletNøkler = new Set(
        data.feilet.map((f) => `${f.dato}_${f.startTid}_${f.sluttTid}_${f.baneId}`)
      );

      const suksess = bookinger
        .filter(
          (b) =>
            !feiletNøkler.has(
              `${b.forespørsel.dato}_${b.forespørsel.startTid}_${b.forespørsel.sluttTid}_${b.forespørsel.baneId}`
            )
        )
        .map((b) => b.lokalId);

      const feilet = bookinger
        .filter((b) =>
          feiletNøkler.has(
            `${b.forespørsel.dato}_${b.forespørsel.startTid}_${b.forespørsel.sluttTid}_${b.forespørsel.baneId}`
          )
        )
        .map((b) => {
          const matchFeil = data.feilet.find(
            (f) =>
              f.dato === b.forespørsel.dato &&
              f.startTid === b.forespørsel.startTid &&
              f.sluttTid === b.forespørsel.sluttTid &&
              f.baneId === b.forespørsel.baneId
          );
          return {
            lokalId: b.lokalId,
            feilmelding: matchFeil?.feilmelding ?? "Ukjent feil",
          };
        });

      return { suksess, feilet };
    } finally {
      await invalidere();
    }
  };

  return {
    leggTilBooking,
    batchLeggTil,
    isLoading: mutation.isPending,
    feil: mutation.error,
  };
}
