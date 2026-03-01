import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { AktivtArrangementRespons } from "@/types";

export function useAktiveArrangementer(enabled: boolean) {
  const slug = useSlug();
  return useApiQuery<AktivtArrangementRespons[]>(
    ["aktiveArrangementer", slug],
    `/klubb/${slug}/arrangement/aktive`,
    { requireAuth: true, enabled, staleTime: 30_000 }
  );
}
