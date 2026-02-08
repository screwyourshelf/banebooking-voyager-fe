import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { KommendeArrangementRespons } from "@/types";

export function useKommendeArrangementer() {
  const slug = useSlug();

  return useApiQuery<KommendeArrangementRespons[]>(
    ["kommende-arrangementer", slug],
    `/klubb/${slug}/arrangement/kommende`,
    {
      requireAuth: true,
      staleTime: 30_000,
      select: (arr) => [...arr].sort((a, b) => a.startDato.localeCompare(b.startDato)),
    }
  );
}
