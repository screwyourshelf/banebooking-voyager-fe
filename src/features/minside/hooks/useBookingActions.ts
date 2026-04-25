import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

export type FjernVars = {
  bookingId: string;
};

export function useBookingActions() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    // mine bookinger (begge varianter inkl historiske)
    void queryClient.invalidateQueries({ queryKey: ["mineBookinger", slug] });

    // alle "bookinger" queries (index/baner/dato)
    void queryClient.invalidateQueries({ queryKey: ["bookinger", slug] });
  };

  const fjernMutation = useApiMutation<FjernVars, void>(
    "delete",
    (vars) => `/klubb/${slug}/bookinger/${vars.bookingId}`,
    {
      getBody: () => undefined,
      onSuccess: () => {
        toast.info("Bookingen er avbestilt.");
      },
      onSettled: () => {
        invalidateAll();
      },
    }
  );

  const fjern = (key: FjernVars) => {
    fjernMutation.mutate(key);
  };

  const fjernAsync = async (key: FjernVars) => {
    return fjernMutation.mutateAsync(key);
  };

  return {
    fjern,
    fjernAsync,
    isPending: fjernMutation.isPending,
    error: fjernMutation.error,
  };
}
