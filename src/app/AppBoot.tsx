import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSlug } from "@/hooks/useSlug";
import api from "@/api/api";
import { useKlubb } from "@/hooks/useKlubb";
import LoaderSkeleton from "@/components/LoaderSkeleton";

export default function AppBoot({ children }: { children: React.ReactNode }) {
    const slug = useSlug();
    const qc = useQueryClient();

    const { data: klubb, isLoading: loadingKlubb } = useKlubb(); // antar useKlubb bruker slug fra context

    useEffect(() => {
        localStorage.setItem("slug", slug);

        void qc.prefetchQuery({
            queryKey: ["feed", slug],
            queryFn: async () => (await api.get(`/klubb/${slug}/feed`, { requireAuth: true })).data,
            staleTime: 60_000,
        });
    }, [slug, qc]);

    if (loadingKlubb) {
        // Stabil ramme: mindre “blink/layout shift”
        return (
            <div className="p-4">
                <LoaderSkeleton />
            </div>
        );
    }

    // Hvis du vil: håndter “klubb finnes ikke”
    if (!klubb) {
        return <div className="p-4">Fant ikke klubb.</div>;
    }

    return <>{children}</>;
}
