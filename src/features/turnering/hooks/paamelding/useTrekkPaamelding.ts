import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

type TrekkPaameldingPayload = { paameldingId: string };

export function useTrekkPaamelding(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
    void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };

  return useApiMutation<TrekkPaameldingPayload, void>(
    "delete",
    ({ paameldingId }) =>
      `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding/${paameldingId}`,
    {
      onSuccess: () => {
        toast.success("Påmelding trukket.");
        invalidate();
      },
    }
  );
}
