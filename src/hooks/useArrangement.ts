import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    forhandsvisArrangement,
    opprettArrangement,
    hentKommendeArrangementer,
} from '../api/arrangement.js';
import { useKlubb } from './useKlubb.js';
import { useBaner } from './useBaner.js';
import type { BookingDto, OpprettArrangementDto, ArrangementDto } from '../types/index.js';

function parseTimeToMinutes(tid: string) {
    const [h, m] = tid.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(mins: number): string {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
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

export function useArrangement(slug: string | undefined) {
    const { klubb, laster: loadingKlubb } = useKlubb(slug);
    const { baner, isLoading: loadingBaner } = useBaner();

    const [loadingArrangementer, setLoadingArrangementer] = useState(false);
    const [loadingForhandsvisning, setLoadingForhandsvisning] = useState(false);

    const [forhandsvisning, setForhandsvisning] = useState<{
        ledige: BookingDto[];
        konflikter: BookingDto[];
    }>({ ledige: [], konflikter: [] });

    const [arrangementer, setArrangementer] = useState<ArrangementDto[]>([]);

    const tilgjengeligeTidspunkter = useMemo(() => {
        if (!klubb?.bookingRegel) return [];
        const start = klubb.bookingRegel.aapningstid || '08:00';
        const slutt = klubb.bookingRegel.stengetid || '22:00';
        const slot = klubb.bookingRegel.slotLengdeMinutter || 60;
        return genererTidspunkter(start, slutt, slot);
    }, [klubb]);

    const lastArrangementer = async () => {
        if (!slug) return;
        setLoadingArrangementer(true);
        try {
            const result = await hentKommendeArrangementer(slug);
            const sortert = result.sort((a, b) => a.startDato.localeCompare(b.startDato));
            setArrangementer(sortert);
        } catch {
            toast.error('Feil ved henting av arrangementer');
        } finally {
            setLoadingArrangementer(false);
        }
    };

    useEffect(() => {
        lastArrangementer();
    }, [slug]);

    const forhandsvis = async (dto: OpprettArrangementDto) => {
        if (!slug) return;
        setLoadingForhandsvisning(true);
        try {
            const data = await forhandsvisArrangement(slug, dto);
            setForhandsvisning(data);
            return { success: true };
        } catch {
            toast.error('Feil ved forhåndsvisning');
            return { success: false };
        } finally {
            setLoadingForhandsvisning(false);
        }
    };

    const opprett = async (dto: OpprettArrangementDto) => {
        if (!slug) return;
        setLoadingForhandsvisning(true);
        try {
            const result = await opprettArrangement(slug, dto);
            setForhandsvisning({ ledige: [], konflikter: [] });
            toast.success(`${result.opprettet.length} bookinger opprettet`);
            await lastArrangementer();
            return { success: true, result };
        } catch {
            toast.error('Feil ved oppretting');
            return { success: false };
        } finally {
            setLoadingForhandsvisning(false);
        }
    };

    return {
        klubb,
        baner,
        isLoading: loadingKlubb || loadingBaner || loadingArrangementer,
        isLoadingForhandsvisning: loadingForhandsvisning,
        tilgjengeligeTidspunkter,
        forhandsvisning,
        setForhandsvisning,
        forhandsvis,
        opprett,
        arrangementer,
        lastArrangementer,
    };
}
