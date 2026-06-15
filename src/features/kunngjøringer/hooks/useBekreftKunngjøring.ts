import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

export function useBekreftKunngjøring(kunngjøringId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const mutation = useApiMutation<void, void>(
    "post",
    `/klubb/${slug}/kunngjøringer/${kunngjøringId}/bekreft`,
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["bruker", slug] });
      },
      retry: false,
    }
  );

  return {
    bekreft: () => mutation.mutateAsync(undefined),
    laster: mutation.isPending,
    feil: mutation.error,
  };
}
