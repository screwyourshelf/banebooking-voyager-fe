// src/hooks/useBruker.ts
import { useEffect, useState } from 'react';
import { hentInnloggetBruker } from '../api/bruker.js';
import type { BrukerDto } from '../types/index.js';

export function useBruker(slug?: string) {
    const [bruker, setBruker] = useState<BrukerDto | null>(null);
    const [laster, setLaster] = useState(true);
    const [feil, setFeil] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        const abort = new AbortController();
        setLaster(true);

        hentInnloggetBruker(slug)
            .then((data) => {
                if (!abort.signal.aborted) {
                    setBruker(data); // `null` hvis ikke innlogget
                    setFeil(null);
                }
            })
            .catch((err) => {
                if (!abort.signal.aborted) {
                    setFeil(err.message);
                    setBruker(null);
                }
            })
            .finally(() => {
                if (!abort.signal.aborted) {
                    setLaster(false);
                }
            });

        return () => abort.abort();
    }, [slug]);

    return { bruker, laster, feil };
}
