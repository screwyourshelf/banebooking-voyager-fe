import type { BrukerDto } from '../types/index.js';
import { fetchWithAuth } from './fetchWithAuth.js';

export async function hentInnloggetBruker(slug: string): Promise<BrukerDto | null> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker`,
        { method: 'GET' },
        true
    );

    if (!res.ok) {
        const feilmelding = await res.text();
        throw new Error(feilmelding || 'Kunne ikke hente bruker');
    }

    const data = await res.json();
    return data ?? null;
}
