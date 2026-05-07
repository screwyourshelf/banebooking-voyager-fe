import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

import type { BookingSuksessRespons } from "@/types";

/**
 * Kaller DELETE /api/klubb/{slug}/arrangement/{arrangementId}/bookinger/{bookingId}.
 * Hard delete – bookingen fjernes permanent.
 * Re-fetcher booking-lista og arrangementlisten etter suksess.
 */
export function useSlettArrangementBooking(arrangementId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const mutation = useApiMutation<string, BookingSuksessRespons>(
    "delete",
    (bookingId) => `/klubb/${slug}/arrangement/${arrangementId}/bookinger/${bookingId}`,
    {
      onSuccess: async () => {
        toast.success("Booking fjernet.");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["arrangement-bookinger", slug, arrangementId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["arrangementer-admin", slug],
          }),
        ]);
      },
      retry: false,
    }
  );

  return {
    /** bookingId = backend UUID (eksternId på LokalBooking) */
    slettBooking: (bookingId: string) => mutation.mutateAsync(bookingId),
    isLoading: mutation.isPending,
    feil: mutation.error,
  };
}
