import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { OpprettTurneringForespørsel, TurneringRespons } from "@/types";

export function useOpprettTurnering() {
  const slug = useSlug();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useApiMutation<OpprettTurneringForespørsel, TurneringRespons>(
    "post",
    `/klubb/${slug}/turnering`,
    {
      onSuccess: (data) => {
        toast.success("Turnering opprettet");
        void queryClient.invalidateQueries({ queryKey: ["arrangementer", slug] });
        navigate(`/${slug}/turnering/${data.id}`);
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke opprette turnering.");
      },
    }
  );
}
