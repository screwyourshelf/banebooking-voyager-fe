import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { OppdaterPaameldingStatusForespørsel, TurneringPaameldingRespons } from "@/types";

type Payload = OppdaterPaameldingStatusForespørsel & { paameldingId: string };

export function useOppdaterPaameldingStatus(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
    void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };

  return useApiMutation<Payload, TurneringPaameldingRespons>(
    "put",
    ({ paameldingId }) =>
      `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding/${paameldingId}/status`,
    {
      getBody: (payload) => ({ nyStatus: payload.nyStatus, adminMerknad: payload.adminMerknad }),
      onSuccess: () => {
        toast.success("Status oppdatert");
        invalidate();
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke oppdatere status.");
      },
    }
  );
}
