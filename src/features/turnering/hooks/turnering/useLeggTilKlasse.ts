import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { LeggTilKlasseForespørsel, TurneringKlasseRespons } from "@/types";

export function useLeggTilKlasse(turneringId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  return useApiMutation<LeggTilKlasseForespørsel, TurneringKlasseRespons>(
    "post",
    `/klubb/${slug}/turnering/${turneringId}/klasse`,
    {
      onSuccess: () => {
        toast.success("Klasse lagt til");
        void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
      },
    }
  );
}
