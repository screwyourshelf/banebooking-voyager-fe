import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { hentMineBookinger } from "../api/booking.js";
import type { BookingSlot } from "../types/index.js";

export function useMineBookinger(
  slug: string | undefined,
  inkluderHistoriske = false
) {
  return useQuery<BookingSlot[], Error>({
    queryKey: ["mineBookinger", slug, inkluderHistoriske],
    queryFn: async () => {
      if (!slug) return [];
      return await hentMineBookinger(slug, inkluderHistoriske);
    },
    enabled: !!slug,
    staleTime: 60_000,
    onError: (err) =>
      toast.error(err.message ?? "Ukjent feil ved henting av bookinger"),
  });
}
