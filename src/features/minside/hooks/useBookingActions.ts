import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

export type AvbestillVars = {
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

  const cancelMutation = useApiMutation<AvbestillVars, void>(
    "delete",
    (vars) => `/klubb/${slug}/bookinger/${vars.bookingId}`,
    {
      getBody: () => undefined,
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke avbestille.");
      },
      onSuccess: () => {
        toast.info("Bookingen er avbestilt.");
      },
      onSettled: () => {
        invalidateAll();
      },
    }
  );

  const avbestill = (key: AvbestillVars) => {
    cancelMutation.mutate(key);
  };

  const avbestillAsync = async (key: AvbestillVars) => {
    return cancelMutation.mutateAsync(key);
  };

  return {
    avbestill,
    avbestillAsync,
    isPending: cancelMutation.isPending,
  };
}
