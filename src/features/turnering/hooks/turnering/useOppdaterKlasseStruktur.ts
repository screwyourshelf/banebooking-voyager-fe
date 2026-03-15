import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { OppdaterKlasseStrukturForespørsel, TurneringKlasseRespons } from "@/types";

type Payload = OppdaterKlasseStrukturForespørsel & { klasseId: string };

export function useOppdaterKlasseStruktur(turneringId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  return useApiMutation<Payload, TurneringKlasseRespons>(
    "put",
    ({ klasseId }) => `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}`,
    {
      getBody: ({ klasseId: _klasseId, ...rest }) => rest,
      onSuccess: () => {
        toast.success("Klassestruktur oppdatert");
        void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
      },
    }
  );
}
