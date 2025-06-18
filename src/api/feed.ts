import type { FeedItemDto } from '../types/index.js';
import { fetchWithAuth } from './fetchWithAuth.js';

export async function hentFeed(slug: string): Promise<FeedItemDto[]> {
    const res = await fetchWithAuth(
        `/api/klubb/${slug}/feed`,
        { method: 'GET' },
        true
    );

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Kunne ikke hente feed');
    }

    return await res.json();
}
