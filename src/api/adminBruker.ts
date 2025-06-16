// src/api/adminBruker.ts
import type { BrukerDto } from '../types/index.js';
import { fetchWithAuth } from './fetchWithAuth.js';

export async function sokEtterBrukere(slug: string, query: string): Promise<BrukerDto[]> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker/sok?query=${encodeURIComponent(query.trim())}`,
        { method: 'GET' },
        true
    );

    if (!res.ok) {
        const tekst = await res.text();
        throw new Error(tekst || 'Kunne ikke hente brukere');
    }

    return await res.json();
}

export async function oppdaterRolle(slug: string, brukerId: string, nyRolle: string): Promise<void> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker/${brukerId}/rolle`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nyRolle)
        },
        true
    );

    if (!res.ok) {
        const tekst = await res.text();
        throw new Error(tekst || 'Kunne ikke oppdatere rolle');
    }
}

