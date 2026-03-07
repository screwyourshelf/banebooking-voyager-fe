import { useApiQuery } from "@/hooks/useApiQuery";
import type { MinBookingRespons } from "@/types";
import { useSlug } from "@/hooks/useSlug";

export function useMineBookinger(inkluderHistoriske = false) {
  const slug = useSlug();

  return useApiQuery<MinBookingRespons[]>(
    ["mineBookinger", slug, inkluderHistoriske],
    `/klubb/${slug}/bookinger/mine${inkluderHistoriske ? "?inkluderHistoriske=true" : ""}`,
    {
      requireAuth: true,
      staleTime: 60_000,
    }
  );
}
