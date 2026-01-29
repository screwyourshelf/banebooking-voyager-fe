import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";

export type BookingSlotKey = {
    baneId: string;
    dato: string; // yyyy-MM-dd
    startTid: string; // HH:mm
    sluttTid: string; // HH:mm
};

export function useBookingActions(slug: string | undefined) {
    const queryClient = useQueryClient();
    const slugKey = slug ?? "";

    const invalidateAll = () => {
        // mine bookinger (begge varianter inkl historiske)
        queryClient.invalidateQueries({ queryKey: ["mineBookinger", slugKey] });

        // alle "bookinger" queries (index/baner/dato)
        queryClient.invalidateQueries({ queryKey: ["bookinger", slugKey] });
    };

    const cancelMutation = useApiMutation<BookingSlotKey, void>(
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

    const avbestill = (key: BookingSlotKey) => {
        if (!slug) {
            toast.error("Mangler klubb (slug).");
            return;
        }
        cancelMutation.mutate(key);
    };

    const avbestillAsync = async (key: BookingSlotKey) => {
        if (!slug) {
            toast.error("Mangler klubb (slug).");
            return;
        }
        return cancelMutation.mutateAsync(key);
    };

    return {
        avbestill,
        avbestillAsync,
        isPending: cancelMutation.isPending,
    };
}
