import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { GenererKampplanForespørsel, GenererKampplanRespons } from "@/types";

export function useGenererKampplan(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["draw", slug, turneringId, klasseId] });
    void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };

  return useApiMutation<GenererKampplanForespørsel, GenererKampplanRespons>(
    "post",
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/kampplan`,
    {
      onSuccess: (data) => {
        toast.success(`Kampplan generert: ${data.antallKamperPlanlagt} kamper planlagt`);
        invalidate();
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke generere kampplan.");
      },
    }
  );
}
