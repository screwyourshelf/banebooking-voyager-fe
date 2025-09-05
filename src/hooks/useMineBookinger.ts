import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { hentMineBookinger } from "../api/booking.js";
import type { BookingSlot } from "../types/index.js";

/**
 * Henter bookinger for innlogget bruker i gitt klubb (slug).
 *
 * @param slug - Klubbindentifikator (fra URL eller context)
 * @param inkluderHistoriske - Om historiske bookinger skal inkluderes
 */
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
    enabled: !!slug, // kjør bare når slug finnes
    staleTime: 1000 * 60, // data er "fersk" i 1 minutt
    onError: (err) => {
      toast.error(err.message ?? "Ukjent feil ved henting av bookinger");
    },
  });
}
