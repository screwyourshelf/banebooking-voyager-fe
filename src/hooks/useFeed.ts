import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { FeedItemDto } from '../types/index.js';
import { hentFeed } from '../api/feed.js';

export function useFeed(slug?: string) {
    const [feed, setFeed] = useState<FeedItemDto[]>([]);
    const [laster, setLaster] = useState(true);

    useEffect(() => {
        if (!slug) return;

        setLaster(true);
        hentFeed(slug)
            .then(setFeed)
            .catch((err) => {
                toast.error(err.message);
                setFeed([]);
            })
            .finally(() => setLaster(false));
    }, [slug]);

    return { feed, laster };
}
