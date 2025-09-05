import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BookingSlot } from "../types/index.js";
import {
  hentBookinger,
  opprettBooking,
  avbestillBooking,
  slettBooking,
} from "../api/booking.js";

export function useBooking(
  slug: string | undefined,
  dato: string,
  baneId: string
) {
  const queryClient = useQueryClient();
  const [apenSlotTid, setApenSlotTid] = useState<string | null>(null);

  const queryKey = ["bookinger", slug ?? "", baneId ?? "", dato ?? ""];

  const {
    data: slots = [],
    isLoading,
    refetch,
  } = useQuery<BookingSlot[], Error>({
    queryKey,
    queryFn: () => hentBookinger(slug!, baneId, dato),
    enabled: !!slug && !!baneId && !!dato,
    refetchInterval: 60_000,        // auto-refresh hvert 60 sek
    staleTime: 60_000,              // data regnes som "fersk" i 1 minutt
    refetchOnWindowFocus: false,    // ikke spam-fetch ved tabbing
    onError: (err) =>
      toast.error(err.message ?? "Kunne ikke hente bookinger"),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["mineBookinger", slug] });
  };

  const bookMutation = useMutation({
    mutationFn: (slot: BookingSlot) =>
      opprettBooking(slug!, baneId, dato, slot.startTid, slot.sluttTid),
    onSuccess: (_, slot) => {
      const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
      toast.success(`Booket ${tid}`);
      invalidateAll();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Kunne ikke booke."),
  });

  const cancelMutation = useMutation({
    mutationFn: (slot: BookingSlot) =>
      avbestillBooking(slug!, baneId, dato, slot.startTid, slot.sluttTid),
    onSuccess: () => {
      toast.info("Bookingen er avbestilt.");
      invalidateAll();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Kunne ikke avbestille."),
  });

  const deleteMutation = useMutation({
    mutationFn: (slot: BookingSlot) =>
      slettBooking(slug!, slot.baneId, slot.dato, slot.startTid, slot.sluttTid),
    onSuccess: () => {
      toast.success("Booking slettet");
      setApenSlotTid(null);
      invalidateAll();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Kunne ikke slette booking."),
  });

  return {
    slots,
    isLoading,
    apenSlotTid,
    setApenSlotTid,
    onBook: bookMutation.mutate,
    onCancel: cancelMutation.mutate,
    onDelete: deleteMutation.mutate,
    hentBookinger: refetch,
  };
}
