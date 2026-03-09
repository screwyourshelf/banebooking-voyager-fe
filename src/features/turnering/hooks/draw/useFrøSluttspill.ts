import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { FrøSluttspillRespons } from "@/types";

export function useFrøSluttspill(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["draw", slug, turneringId, klasseId] });
    void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };

  return useApiMutation<void, FrøSluttspillRespons>(
    "post",
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/sluttspill/frø`,
    {
      onSuccess: (data) => {
        toast.success(`Sluttspill frødd: ${data.antallSeeded} seeded, ${data.antallByes} byes`);
        invalidate();
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke frø sluttspill.");
      },
    }
  );
}
