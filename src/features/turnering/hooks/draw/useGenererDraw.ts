import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { GenererDrawForespørsel, GenererDrawRespons } from "@/types";

export function useGenererDraw(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["draw", slug, turneringId, klasseId] });
    void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };

  return useApiMutation<GenererDrawForespørsel, GenererDrawRespons>(
    "post",
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/draw`,
    {
      onSuccess: (data) => {
        toast.success("Draw er generert!", {
          description: `${data.antallGruppekamper} gruppekamper · ${data.antallSluttspillKamper} sluttspillkamper`,
        });
        invalidate();
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke generere draw.");
      },
    }
  );
}
