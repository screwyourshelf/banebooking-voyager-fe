import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { KommendeArrangementDto } from "./types";

export function useKommendeArrangementer() {
    const slug = useSlug();

    return useApiQuery<KommendeArrangementDto[]>(
        ["kommende-arrangementer", slug],
        `/klubb/${slug}/arrangement/kommende`,
        {
            requireAuth: true,
            staleTime: 30_000,
            select: (arr) => [...arr].sort((a, b) => a.startDato.localeCompare(b.startDato)),
        }
    );
}
