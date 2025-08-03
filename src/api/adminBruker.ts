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

export async function hentAlleBrukere(slug: string): Promise<BrukerDto[]> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker/admin/bruker`,
        { method: 'GET' },
        true
    );

    if (!res.ok) {
        const tekst = await res.text();
        throw new Error(tekst || 'Kunne ikke hente brukere');
    }

    return await res.json();
}


export async function oppdaterBruker(
    slug: string,
    brukerId: string,
    data: { rolle: string; visningsnavn: string }
): Promise<void> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker/admin/bruker/${brukerId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        },
        true
    );

    if (!res.ok) {
        const tekst = await res.text();
        throw new Error(tekst || 'Kunne ikke oppdatere bruker');
    }
}


