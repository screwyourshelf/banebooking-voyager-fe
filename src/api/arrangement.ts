import { fetchWithAuth } from './fetchWithAuth.js';
import type { BookingDto, ArrangementDto, OpprettArrangementDto } from '../types/index.js';

export async function hentKommendeArrangementer(slug: string): Promise<ArrangementDto[]> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/arrangement/kommende`,
        {},
        true
    );
    return await res.json();
}

export async function slettArrangement(slug: string, arrangementId: string): Promise<{
    arrangementId: string;
    antallBookingerDeaktivert: number;
}> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/arrangement/${arrangementId}`,
        { method: 'DELETE' },
        true
    );

    return await res.json();
}

export async function forhandsvisArrangement(slug: string, dto: OpprettArrangementDto) {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/arrangement/forhandsvis`,
        {
            method: 'POST',
            body: JSON.stringify(dto),
        },
        true
    );

    return await res.json() as {
        ledige: BookingDto[];
        konflikter: BookingDto[];
    };
}

export async function opprettArrangement(slug: string, dto: OpprettArrangementDto): Promise<{
    opprettet: BookingDto[];
    konflikter: {
        dato: string;
        tid: string;
        baneId: string;
        feilmelding: string;
    }[];
}> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/arrangement`,
        {
            method: 'POST',
            body: JSON.stringify(dto),
        },
        true
    );

    return await res.json();
}
