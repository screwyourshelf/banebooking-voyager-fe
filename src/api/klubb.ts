import type { OppdaterKlubb, KlubbDetaljer } from '../types/index.js';
import { fetchWithAuth } from './fetchWithAuth.js';

export async function hentKlubb(slug: string): Promise<KlubbDetaljer> {
    const res = await fetchWithAuth(`/api/klubb/${slug}`);

    if (!res.ok) {
        let feilmelding = 'Kunne ikke hente klubb';
        try {
            const error = await res.json();
            feilmelding = error?.melding || feilmelding;
        } catch {
            // fallback hvis ikke JSON
        }

        throw new Error(feilmelding);
    }

    return await res.json();
}

export async function oppdaterKlubb(slug: string, data: OppdaterKlubb): Promise<void> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}`,
        {
            method: 'PUT',
            body: JSON.stringify(data),
        },
        true // krever auth
    );

    if (!res.ok) {
        throw new Error('Kunne ikke oppdatere klubb');
    }
}
