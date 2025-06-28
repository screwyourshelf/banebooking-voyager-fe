import type { BrukerDto } from '../types/index.js';
import { fetchWithAuth } from './fetchWithAuth.js';

export async function lastNedEgenData(slug: string): Promise<void> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker/meg/egen-data`,
        { method: 'GET' },
        true
    );

    if (!res.ok) {
        const tekst = await res.text();
        throw new Error(tekst || 'Kunne ikke hente egen data');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `banebooking-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export async function hentMeg(slug: string): Promise<BrukerDto> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker/meg`,
        { method: 'GET' },
        true
    );

    if (!res.ok) {
        const tekst = await res.text();
        throw new Error(tekst || 'Kunne ikke hente meg');
    }

    return await res.json();
}

export async function oppdaterMeg(slug: string, data: { visningsnavn?: string }): Promise<void> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker/meg`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        },
        true
    );

    if (!res.ok) {
        const tekst = await res.text();
        throw new Error(tekst || 'Kunne ikke oppdatere visningsnavn');
    }
}

export async function slettMeg(slug: string): Promise<void> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bruker/meg`,
        { method: 'DELETE' },
        true
    );

    if (!res.ok) {
        const tekst = await res.text();
        throw new Error(tekst || 'Kunne ikke slette brukeren');
    }
}
