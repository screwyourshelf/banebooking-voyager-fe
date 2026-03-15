import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { MeldPaaKlasseForespørsel, TurneringPaameldingRespons } from "@/types";

export function useMeldPaaKlasse(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
  };

  return useApiMutation<MeldPaaKlasseForespørsel, TurneringPaameldingRespons>(
    "post",
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding`,
    {
      onSuccess: () => {
        toast.success("Påmelding registrert!");
        invalidate();
      },
    }
  );
}
