import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

export type BookingSlotResponsKey = {
  baneId: string;
  dato: string; // yyyy-MM-dd
  startTid: string; // HH:mm
  sluttTid: string; // HH:mm
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

  const cancelMutation = useApiMutation<BookingSlotResponsKey, void>(
    "delete",
    `/klubb/${slug}/bookinger`,
    {
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

  const avbestill = (key: BookingSlotResponsKey) => {
    cancelMutation.mutate(key);
  };

  const avbestillAsync = async (key: BookingSlotResponsKey) => {
    return cancelMutation.mutateAsync(key);
  };

  return {
    avbestill,
    avbestillAsync,
    isPending: cancelMutation.isPending,
  };
}
