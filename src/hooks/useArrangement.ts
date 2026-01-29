import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiPostQuery } from "@/hooks/useApiPostQuery";
import { useKlubb } from "@/hooks/useKlubb";
import { useBaner } from "@/hooks/useBaner";
import { useSlug } from "@/hooks/useSlug";
import type { BookingDto, OpprettArrangementDto, ArrangementDto } from "@/types";

function parseTimeToMinutes(tid: string) {
    const [h, m] = tid.split(":").map(Number);
    return h * 60 + m;
}

function minutesToTime(mins: number): string {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
}

function genererTidspunkter(start: string, slutt: string, slotMinutter: number): string[] {
    const startMin = parseTimeToMinutes(start);
    const sluttMin = parseTimeToMinutes(slutt);
    const result: string[] = [];

    for (let t = startMin; t + slotMinutter <= sluttMin; t += slotMinutter) {
        result.push(minutesToTime(t));
    }

    return result;
}

type ForhandsvisResultat = {
    ledige: BookingDto[];
    konflikter: BookingDto[];
};

type OpprettResultat = {
    opprettet: BookingDto[];
    konflikter: {
        dato: string;
        tid: string;
        baneId: string;
        feilmelding: string;
    }[];
};

type SlettResultat = {
    arrangementId: string;
    antallBookingerDeaktivert: number;
};

const tomForhandsvisning: ForhandsvisResultat = { ledige: [], konflikter: [] };

// Stabil nøkkel: sorter arrays som ikke er semantisk ordnet
function dtoKey(dto: OpprettArrangementDto) {
    const stable: OpprettArrangementDto = {
        ...dto,
        ukedager: [...dto.ukedager].sort(),
        tidspunkter: [...dto.tidspunkter].sort(),
        baneIder: [...dto.baneIder].sort(),
    };
    return JSON.stringify(stable);
}

export function useArrangement() {
    const slug = useSlug();
    const queryClient = useQueryClient();

    const { data: klubb, isLoading: loadingKlubb } = useKlubb();
    const { baner, isLoading: loadingBaner } = useBaner();

    const tilgjengeligeTidspunkter = useMemo(() => {
        if (!klubb?.bookingRegel) return [];
        const start = klubb.bookingRegel.aapningstid || "08:00";
        const slutt = klubb.bookingRegel.stengetid || "22:00";
        const slot = klubb.bookingRegel.slotLengdeMinutter || 60;
        return genererTidspunkter(start, slutt, slot);
    }, [klubb?.bookingRegel]);

    const arrangementerKey = ["arrangementer", slug] as const;

    const arrangementerQuery = useApiQuery<ArrangementDto[]>(
        arrangementerKey,
        `/klubb/${slug}/arrangement/kommende`,
        {
            requireAuth: true,
            staleTime: 30_000,
            select: (arr) => [...arr].sort((a, b) => a.startDato.localeCompare(b.startDato)),
        }
    );

    // Trigger for forhåndsvisningen (POST-query)
    const [sisteForhandsvisDto, setSisteForhandsvisDto] =
        useState<OpprettArrangementDto | null>(null);

    const forhandsvisKey = sisteForhandsvisDto
        ? (["arrangement-forhandsvis", slug, dtoKey(sisteForhandsvisDto)] as const)
        : (["arrangement-forhandsvis", slug, "empty"] as const);

    const forhandsvisQuery = useApiPostQuery<ForhandsvisResultat, OpprettArrangementDto>(
        forhandsvisKey,
        `/klubb/${slug}/arrangement/forhandsvis`,
        sisteForhandsvisDto, // null => ingen request
        {
            requireAuth: true,
            enabled: !!sisteForhandsvisDto,
            staleTime: 60_000,
            retry: false,
        }
    );

    const forhandsvisning = forhandsvisQuery.data ?? tomForhandsvisning;
    const isLoadingForhandsvisning = forhandsvisQuery.isFetching;

    // UI trigger
    const forhandsvis = async (dto: OpprettArrangementDto) => {
        setSisteForhandsvisDto(dto);
        return { success: true as const };
    };

    const clearForhandsvisning = () => {
        setSisteForhandsvisDto(null);

        // Avbryt evt hengende request + fjern cache for preview
        void queryClient.cancelQueries({ queryKey: ["arrangement-forhandsvis", slug] });
        queryClient.removeQueries({ queryKey: ["arrangement-forhandsvis", slug] });
    };

    const opprettMutation = useApiMutation<OpprettArrangementDto, OpprettResultat>(
        "post",
        `/klubb/${slug}/arrangement`,
        {
            onSuccess: async (result) => {
                clearForhandsvisning();
                toast.success(`${result.opprettet.length} bookinger opprettet`);
                await queryClient.invalidateQueries({ queryKey: arrangementerKey });
            },
            onError: (err) => toast.error(err.message ?? "Feil ved oppretting"),
            retry: false,
        }
    );

    const opprett = async (dto: OpprettArrangementDto) => {
        const result = await opprettMutation.mutateAsync(dto);
        return { success: true as const, result };
    };

    type SlettContext = { previous?: ArrangementDto[] };

    const slettMutation = useApiMutation<{ arrangementId: string }, SlettResultat, SlettContext>(
        "delete",
        ({ arrangementId }) => `/klubb/${slug}/arrangement/${arrangementId}`,
        {
            onMutate: async ({ arrangementId }) => {
                await queryClient.cancelQueries({ queryKey: arrangementerKey });

                const previous = queryClient.getQueryData<ArrangementDto[]>(arrangementerKey);

                queryClient.setQueryData<ArrangementDto[]>(
                    arrangementerKey,
                    (old) => (old ?? []).filter((a) => a.id !== arrangementId)
                );

                return { previous };
            },
            onError: (err, _vars, ctx) => {
                toast.error(err.message ?? "Kunne ikke slette arrangementet");
                if (ctx?.previous) {
                    queryClient.setQueryData(arrangementerKey, ctx.previous);
                }
            },
            onSuccess: (result) => {
                toast.success(
                    `Arrangementet ble avlyst – ${result.antallBookingerDeaktivert} bookinger fjernet`
                );
            },
            onSettled: async () => {
                await queryClient.invalidateQueries({ queryKey: arrangementerKey });
            },
            retry: false,
        }
    );

    const slettArrangement = async (arrangementId: string) => {
        await slettMutation.mutateAsync({ arrangementId });
    };

    return {
        klubb,
        baner,
        tilgjengeligeTidspunkter,

        arrangementer: arrangementerQuery.data ?? [],

        forhandsvisning,
        forhandsvis,
        clearForhandsvisning,
        opprett,
        slettArrangement,
        refetchArrangementer: arrangementerQuery.refetch,

        isLoading: loadingKlubb || loadingBaner || arrangementerQuery.isLoading,
        isLoadingForhandsvisning,
        sletterArrangementId: slettMutation.variables?.arrangementId ?? null,
    };
}
