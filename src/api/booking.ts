import { fetchWithAuth } from './fetchWithAuth.js';
import type { BookingSlot } from '../types/index.js';

export async function hentBookinger(
    slug: string,
    baneId: string,
    dato: string
): Promise<BookingSlot[]> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bookinger?baneId=${baneId}&dato=${dato}`,
        {},
        true
    );

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

export async function opprettBooking(
    slug: string,
    baneId: string,
    dato: string,
    startTid: string,
    sluttTid: string
): Promise<void> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bookinger`,
        {
            method: 'POST',
            body: JSON.stringify({ baneId, dato, startTid, sluttTid }),
        },
        true
    );

    if (!res.ok) {
        let msg = 'Kunne ikke booke';
        try {
            const error = await res.json();
            msg = error?.melding || msg;
        } catch { /* empty */ }
        throw new Error(msg);
    }
}

export async function avbestillBooking(
    slug: string,
    baneId: string,
    dato: string,
    startTid: string,
    sluttTid: string
): Promise<void> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bookinger`,
        {
            method: 'DELETE',
            body: JSON.stringify({ baneId, dato, startTid, sluttTid }),
        },
        true
    );

    if (!res.ok) {
        let msg = 'Kunne ikke avbestille';
        try {
            const error = await res.json();
            msg = error?.melding || msg;
        } catch { /* empty */ }
        throw new Error(msg);
    }
}

export async function hentMineBookinger(slug: string): Promise<BookingSlot[]> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/bookinger/mine`,
        {},
        true
    );

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}
