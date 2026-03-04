import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { ArrangementRespons } from "@/types";

export function useArrangementer(inkluderHistoriske = false) {
  const slug = useSlug();

  return useApiQuery<ArrangementRespons[]>(
    ["arrangementer", slug, inkluderHistoriske],
    `/klubb/${slug}/arrangementer${inkluderHistoriske ? "?inkluderHistoriske=true" : ""}`,
    {
      requireAuth: true,
      staleTime: 30_000,
      select: (arr) =>
        [...arr].sort((a, b) => {
          if (a.erPassert !== b.erPassert) return a.erPassert ? 1 : -1;
          if (a.erPassert) return b.startDato.localeCompare(a.startDato);
          return a.startDato.localeCompare(b.startDato);
        }),
    }
  );
}
