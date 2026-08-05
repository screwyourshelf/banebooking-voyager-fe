import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { ApiError } from "@/api/api";
import { useAuth } from "@/hooks/useAuth";
import { useSlug } from "@/hooks/useSlug";
import type { BookingBootstrapRespons } from "@/types";
import { tilDatoTekst } from "@/utils/datoUtils";
import { hydrerBookingBootstrapCache } from "./bookingBootstrapCache";

export const bookingBootstrapQueryKeys = {
  initial: (slug: string, dato: string, brukerIdentitet: string) =>
    ["booking-bootstrap", slug, dato, brukerIdentitet] as const,
};

export function skalBrukeLegacyBootstrapFallback(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.status === 405);
}

/**
 * Henter og hydrerer hele første bookingvisning. Kun en backend som ikke har
 * endepunktet ennå faller tilbake til de eksisterende enkeltkallene.
 */
export function useBookingBootstrap(enabled: boolean) {
  const slug = useSlug();
  const queryClient = useQueryClient();
  const { currentUser, ready } = useAuth();
  const [dato] = useState(() => tilDatoTekst(new Date()));
  const brukerIdentitet = currentUser?.id ?? "anonym";

  return useQuery({
    queryKey: bookingBootstrapQueryKeys.initial(slug, dato, brukerIdentitet),
    queryFn: async ({ signal }) => {
      try {
        const response = await api.get<BookingBootstrapRespons>(
          `/klubb/${slug}/booking-bootstrap?dato=${dato}`,
          {
            requireAuth: Boolean(currentUser),
            signal,
          }
        );
        hydrerBookingBootstrapCache(queryClient, slug, response.data);
        return true;
      } catch (error) {
        if (signal.aborted) throw error;
        if (skalBrukeLegacyBootstrapFallback(error)) return false;
        throw error;
      }
    },
    enabled: enabled && ready && Boolean(slug),
    staleTime: 60_000,
    retry: false,
  });
}
