import { useMemo, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    slettArrangement as slettArrangementApi,
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
    const { klubb, isLoading: loadingKlubb } = useKlubb(slug);
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

    const lastArrangementer = useCallback(async () => {
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
    }, [slug]);

    useEffect(() => {
        lastArrangementer();
    }, [lastArrangementer]);

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
    const [sletterArrangementId, setSletterArrangementId] = useState<string | null>(null);

    const slettArrangement = async (arrangementId: string) => {
        if (!slug) return;
        setSletterArrangementId(arrangementId);
        try {
            const result = await slettArrangementApi(slug, arrangementId);
            toast.success(`Arrangementet ble avlyst – ${result.antallBookingerDeaktivert} bookinger fjernet`);
            await lastArrangementer(); // re-fetch
        } catch {
            toast.error('Kunne ikke slette arrangementet');
        } finally {
            setSletterArrangementId(null);
        }
    };

    return {
        klubb,
        baner,
        isLoading: loadingKlubb || loadingBaner || loadingArrangementer,
        isLoadingForhandsvisning: loadingForhandsvisning,
        sletterArrangementId,
        tilgjengeligeTidspunkter,
        forhandsvisning,
        setForhandsvisning,
        forhandsvis,
        opprett,
        slettArrangement,
        arrangementer,
        lastArrangementer,
    };
}
