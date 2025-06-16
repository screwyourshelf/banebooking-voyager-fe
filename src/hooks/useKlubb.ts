import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { KlubbDetaljer } from '../types/index.js';
import { hentKlubb } from '../api/klubb.js';

export function useKlubb(slug?: string) {
    const [klubb, setKlubb] = useState<KlubbDetaljer | null>(null);
    const [laster, setLaster] = useState(true);

    useEffect(() => {
        if (!slug) return;

        setLaster(true);
        hentKlubb(slug)
            .then(setKlubb)
            .catch((err) => {
                toast.error(err.message);
                setKlubb(null);
            })
            .finally(() => setLaster(false));
    }, [slug]);

    return { klubb, laster };
}
