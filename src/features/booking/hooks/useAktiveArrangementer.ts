import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { AktivtArrangementRespons } from "@/types";

export function useAktiveArrangementer(grenId: string, enabled: boolean) {
  const slug = useSlug();
  return useApiQuery<AktivtArrangementRespons[]>(
    ["aktiveArrangementer", slug, grenId],
    `/klubb/${slug}/arrangement/aktive?grenId=${encodeURIComponent(grenId)}`,
    { requireAuth: true, enabled: enabled && Boolean(grenId), staleTime: 30_000 }
  );
}
