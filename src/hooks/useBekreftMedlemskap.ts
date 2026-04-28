import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { BekreftMedlemskapForespørsel } from "@/types";

export function useBekreftMedlemskap() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const mutation = useApiMutation<BekreftMedlemskapForespørsel, void>(
    "post",
    `/klubb/${slug}/bruker/bekreft-medlemskap`,
    {
      onSuccess: async () => {
        toast.success("Medlemskap bekreftet!");
        await queryClient.invalidateQueries({ queryKey: ["bruker", slug] });
      },
      retry: false,
    }
  );

  return {
    bekreft: (forespørsel: BekreftMedlemskapForespørsel) => mutation.mutateAsync(forespørsel),
    laster: mutation.isPending,
    vellykket: mutation.isSuccess,
    feil: mutation.error,
  };
}
