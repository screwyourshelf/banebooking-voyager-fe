import type { FeedItemDto } from '../types/index.js';

export async function hentFeed(slug: string): Promise<FeedItemDto[]> {
    const res = await fetch(`/api/klubb/${slug}/feed`);

    if (!res.ok) {
        throw new Error('Kunne ikke hente feed');
    }

    return await res.json();
}
