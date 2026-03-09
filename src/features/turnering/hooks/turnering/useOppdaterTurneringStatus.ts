import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { OppdaterTurneringStatusForespørsel, TurneringRespons } from "@/types";

export function useOppdaterTurneringStatus(turneringId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  return useApiMutation<OppdaterTurneringStatusForespørsel, TurneringRespons>(
    "put",
    `/klubb/${slug}/turnering/${turneringId}/status`,
    {
      onSuccess: () => {
        toast.success("Status oppdatert");
        void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke endre status.");
      },
    }
  );
}
