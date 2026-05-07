import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

import type {
  OppdaterArrangementMetadataForespørsel,
  OppdaterArrangementMetadataRespons,
} from "@/types";

/**
 * Kaller PATCH /api/klubb/{slug}/arrangement/{id}/metadata.
 * Berører ikke bookinger.
 */
export function useOppdaterArrangementMetadata(arrangementId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const mutation = useApiMutation<
    OppdaterArrangementMetadataForespørsel,
    OppdaterArrangementMetadataRespons
  >("patch", `/klubb/${slug}/arrangement/${arrangementId}/metadata`, {
    onSuccess: async () => {
      toast.success("Metadata lagret.");
      await queryClient.invalidateQueries({ queryKey: ["arrangementer-admin", slug] });
    },
    retry: false,
  });

  const lagreMetadata = (forespørsel: OppdaterArrangementMetadataForespørsel) =>
    mutation.mutateAsync(forespørsel);

  return {
    lagreMetadata,
    isLoading: mutation.isPending,
    feil: mutation.error,
  };
}
