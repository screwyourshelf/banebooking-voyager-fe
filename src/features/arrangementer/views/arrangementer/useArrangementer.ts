import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import { useAuth } from "@/hooks/useAuth";
import type { ArrangementRespons } from "@/types";

export function useArrangementer(inkluderHistoriske = false) {
  const slug = useSlug();
  const { currentUser } = useAuth();

  const params = inkluderHistoriske ? "?inkluderHistoriske=true" : "";
  const url = currentUser
    ? `/klubb/${slug}/arrangementer${params}`
    : `/offentlig/klubb/${slug}/arrangementer/visning${params}`;

  return useApiQuery<ArrangementRespons[]>(
    ["arrangementer", slug, inkluderHistoriske, !!currentUser],
    url,
    {
      requireAuth: !!currentUser,
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
