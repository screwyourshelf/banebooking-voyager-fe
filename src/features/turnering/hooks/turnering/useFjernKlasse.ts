import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

type FjernKlassePayload = { klasseId: string };

export function useFjernKlasse(turneringId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  return useApiMutation<FjernKlassePayload, void>(
    "delete",
    ({ klasseId }) => `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}`,
    {
      onSuccess: () => {
        toast.success("Klasse fjernet");
        void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
      },
    }
  );
}
