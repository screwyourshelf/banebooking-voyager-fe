import { fetchWithAuth } from './fetchWithAuth.js';
import type { BookingDto, ArrangementDto, OpprettArrangementDto } from '../types/index.js';

export async function hentKommendeArrangementer(slug: string): Promise<ArrangementDto[]> {
    const res = await fetchWithAuth(`/api/klubb/${slug}/arrangement/kommende`);
    return await res.json();
}

export async function forhandsvisArrangement(slug: string, dto: OpprettArrangementDto) {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/arrangement/forhandsvis`,
        {
            method: 'POST',
            body: JSON.stringify(dto),
        },
        true // krever auth
    );

    return await res.json() as {
        ledige: BookingDto[];
        konflikter: BookingDto[];
    };
}

export async function opprettArrangement(slug: string, dto: OpprettArrangementDto) {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/arrangement`,
        {
            method: 'POST',
            body: JSON.stringify(dto),
        },
        true // krever auth
    );

    return await res.json() as {
        opprettet: BookingDto[];
        konflikter: {
            dato: string;
            tid: string;
            baneId: string;
            feilmelding: string;
        }[];
    };
}
