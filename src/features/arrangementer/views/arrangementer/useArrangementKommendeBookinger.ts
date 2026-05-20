import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import { useAuth } from "@/hooks/useAuth";
import type { ArrangementBookingRespons } from "@/types";

/**
 * Henter faktiske bookinger for ett arrangement.
 * Filtrerer til kommende bookinger (dato >= i dag), sortert dato + startTid ASC.
 * Kalles kun for innloggede brukere.
 */
export function useArrangementKommendeBookinger(arrangementId: string) {
  const slug = useSlug();
  const { currentUser } = useAuth();
  const idag = new Date().toISOString().slice(0, 10);

  const { data, isLoading } = useApiQuery<ArrangementBookingRespons[]>(
    ["arrangement-bookinger", slug, arrangementId],
    `/klubb/${slug}/arrangement/${arrangementId}/bookinger`,
    {
      requireAuth: true,
      staleTime: 60_000,
      enabled: !!currentUser,
    }
  );

  const kommendeBookinger = (data ?? [])
    .filter((b) => b.dato >= idag)
    .sort((a, b) => a.dato.localeCompare(b.dato) || a.startTid.localeCompare(b.startTid));

  return { kommendeBookinger, isLoading: isLoading && !!currentUser };
}
