import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSlug } from "@/hooks/useSlug";
import api from "@/api/api";
import { useKlubb } from "@/hooks/useKlubb";

export default function AppBoot({ children }: { children: React.ReactNode }) {
    const slug = useSlug();
    const qc = useQueryClient();

    const { isLoading: loadingKlubb } = useKlubb();

    useEffect(() => {
        localStorage.setItem("slug", slug);

        void qc.prefetchQuery({
            queryKey: ["feed", slug],
            queryFn: async () => (await api.get(`/klubb/${slug}/feed`, { requireAuth: true })).data,
            staleTime: 60_000,
        });
    }, [slug, qc]);

    if (loadingKlubb) return null;

    return <>{children}</>;
}
