import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { BookingSlotRespons } from "@/types";
import { useSlug } from "@/hooks/useSlug";

export function useMineBookinger(inkluderHistoriske = false) {
    const slug = useSlug();

    const query = useApiQuery<BookingSlotRespons[]>(
        ["mineBookinger", slug, inkluderHistoriske],
        `/klubb/${slug}/bookinger/mine${inkluderHistoriske ? "?inkluderHistoriske=true" : ""
        }`,
        {
            requireAuth: true,
            staleTime: 60_000,
        }
    );

    // Toast feil (�n gang per feil)
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
