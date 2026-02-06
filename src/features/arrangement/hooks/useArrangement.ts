import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiPostQuery } from "@/hooks/useApiPostQuery";
import { useKlubb } from "@/hooks/useKlubb";
import { useBaner } from "@/hooks/useBaner";
import { useSlug } from "@/hooks/useSlug";

import type { OpprettArrangementDto } from "@/types";

import type { OpprettArrangementResponsDto, ArrangementForhandsvisningDto } from "../types";

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

const tomForhandsvisning: ArrangementForhandsvisningDto = { ledige: [], konflikter: [] };

// Stabil nøkkel: sorter arrays som ikke er semantisk ordnet
function dtoKey(dto: OpprettArrangementDto) {
    const stable: OpprettArrangementDto = {
        ...dto,
        // ukedager er number[] (DayOfWeek 0-6) -> sorter numerisk
        ukedager: [...dto.ukedager].sort((a, b) => a - b),
        tidspunkter: [...dto.tidspunkter].sort(), // "HH:mm" -> lex fungerer
        baneIder: [...dto.baneIder].sort(),       // Guid-string -> lex ok
    };

    return JSON.stringify(stable);
}

export function useArrangement() {
    const slug = useSlug();
    const queryClient = useQueryClient();

    const { data: klubb, isLoading: loadingKlubb } = useKlubb();
    const { baner, isLoading: loadingBaner } = useBaner(false);

    const tilgjengeligeTidspunkter = useMemo(() => {
        const regel = klubb?.bookingRegel;
        if (!regel) return [];

        const start = regel.aapningstid || "08:00";
        const slutt = regel.stengetid || "22:00";
        const slot = regel.slotLengdeMinutter || 60;

        return genererTidspunkter(start, slutt, slot);
    }, [klubb?.bookingRegel]);

    // ───────── Preview (POST-query) ─────────
    const [sisteForhandsvisDto, setSisteForhandsvisDto] = useState<OpprettArrangementDto | null>(
        null
    );

    const forhandsvisKey = sisteForhandsvisDto
        ? (["arrangement-forhandsvis", slug, dtoKey(sisteForhandsvisDto)] as const)
        : (["arrangement-forhandsvis", slug, "empty"] as const);

    const forhandsvisQuery = useApiPostQuery<ArrangementForhandsvisningDto, OpprettArrangementDto>(
        forhandsvisKey,
        `/klubb/${slug}/arrangement/forhandsvis`,
        sisteForhandsvisDto,
        {
            requireAuth: true,
            enabled: !!sisteForhandsvisDto,
            staleTime: 60_000,
            retry: false,
        }
    );

    const forhandsvisning = forhandsvisQuery.data ?? tomForhandsvisning;
    const isLoadingForhandsvisning = forhandsvisQuery.isFetching;

    const forhandsvis = async (dto: OpprettArrangementDto) => {
        setSisteForhandsvisDto(dto);
        return { success: true as const };
    };

    const clearForhandsvisning = () => {
        setSisteForhandsvisDto(null);
        void queryClient.cancelQueries({ queryKey: ["arrangement-forhandsvis", slug] });
        queryClient.removeQueries({ queryKey: ["arrangement-forhandsvis", slug] });
    };

    // ───────── Opprett ─────────
    const opprettMutation = useApiMutation<OpprettArrangementDto, OpprettArrangementResponsDto>(
        "post",
        `/klubb/${slug}/arrangement`,
        {
            onSuccess: async (result) => {
                clearForhandsvisning();
                toast.success(`${result.opprettet.length} bookinger opprettet`);

                // Hvis du har en liste over "kommende arrangementer", invalidér den her:
                // await queryClient.invalidateQueries({ queryKey: ["kommende-arrangementer", slug] });
                // eller (hvis dere fortsatt bruker den gamle):
                // await queryClient.invalidateQueries({ queryKey: ["arrangementer", slug] });
            },
            onError: (err) => toast.error(err.message ?? "Feil ved oppretting"),
            retry: false,
        }
    );

    const opprett = async (dto: OpprettArrangementDto) => {
        const result = await opprettMutation.mutateAsync(dto);
        return { success: true as const, result };
    };

    return {
        klubb,
        baner,
        tilgjengeligeTidspunkter,

        forhandsvisning,
        forhandsvis,
        clearForhandsvisning,

        opprett,

        isLoading: loadingKlubb || loadingBaner,
        isLoadingForhandsvisning,
    };
}
