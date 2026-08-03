import { keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type {
  BookingstatistikkFiltre,
  BookingstatistikkRespons,
} from "@/features/statistikk/types";

export function useBookingstatistikk(filtre: BookingstatistikkFiltre) {
  const slug = useSlug();
  const { fra, til, sammenlignMedForrigeÅr, grenId, baneId } = filtre;

  const parametere = new URLSearchParams({
    fra,
    til,
    sammenlignMedForrigeÅr: String(sammenlignMedForrigeÅr),
  });

  if (grenId) parametere.set("grenId", grenId);
  if (baneId) parametere.set("baneId", baneId);

  return useApiQuery<BookingstatistikkRespons>(
    ["bookingstatistikk", slug, fra, til, sammenlignMedForrigeÅr, grenId, baneId],
    `/klubb/${slug}/statistikk/bookinger?${parametere.toString()}`,
    {
      requireAuth: true,
      staleTime: 15 * 60 * 1000,
      placeholderData: keepPreviousData,
    }
  );
}
