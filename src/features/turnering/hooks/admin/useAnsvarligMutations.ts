import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { LeggTilAnsvarligForespørsel, TurneringAnsvarligRespons } from "@/types";

type FjernPayload = { brukerId: string };

export function useAnsvarligMutations(turneringId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["turneringAnsvarlige", slug, turneringId],
    });
  };

  const leggTil = useApiMutation<LeggTilAnsvarligForespørsel, TurneringAnsvarligRespons>(
    "post",
    `/klubb/${slug}/turnering/${turneringId}/ansvarlig`,
    {
      onSuccess: () => {
        toast.success("Ansvarlig lagt til");
        invalidate();
      },
    }
  );

  const fjern = useApiMutation<FjernPayload, void>(
    "delete",
    ({ brukerId }) => `/klubb/${slug}/turnering/${turneringId}/ansvarlig/${brukerId}`,
    {
      onSuccess: () => {
        toast.success("Ansvarlig fjernet");
        invalidate();
      },
    }
  );

  return { leggTil, fjern };
}
