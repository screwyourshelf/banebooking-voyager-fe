import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { BookingSlot } from "@/types";

export function useMineBookinger(
    slug: string | undefined,
    inkluderHistoriske = false
) {
    const query = useApiQuery<BookingSlot[]>(
        ["mineBookinger", slug, inkluderHistoriske],
        `/klubb/${slug}/bookinger/mine${inkluderHistoriske ? "?inkluderHistoriske=true" : ""
        }`,
        {
            requireAuth: true,
            enabled: !!slug,
            staleTime: 60_000,
        }
    );

    // Toast feil (én gang per feil)
    const errorToastetRef = useRef(false);
    useEffect(() => {
        if (!query.error) {
            errorToastetRef.current = false;
            return;
        }
        if (errorToastetRef.current) return;

        toast.error(query.error.message ?? "Ukjent feil ved henting av bookinger");
        errorToastetRef.current = true;
    }, [query.error]);

    return query;
}
