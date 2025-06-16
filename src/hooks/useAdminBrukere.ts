import { useEffect, useState } from 'react';
import type { BrukerDto } from '../types/index.js';
import { sokEtterBrukere } from '../api/adminBruker.js';
import { useDebounce } from 'use-debounce';

export function useAdminBrukere(slug?: string, query: string = '') {
    const [brukere, setBrukere] = useState<BrukerDto[]>([]);
    const [laster, setLaster] = useState(false);
    const [feil, setFeil] = useState<string | null>(null);

    // Debounce søket med 300ms
    const [debouncedQuery] = useDebounce(query.trim(), 300);

    useEffect(() => {
        if (!slug || debouncedQuery.length < 2) return;

        const abort = new AbortController();
        setLaster(true);

        sokEtterBrukere(slug, debouncedQuery)
            .then((data) => {
                if (!abort.signal.aborted) {
                    setBrukere(data);
                    setFeil(null);
                }
            })
            .catch((err) => {
                if (!abort.signal.aborted) {
                    setFeil(err.message);
                    setBrukere([]);
                }
            })
            .finally(() => {
                if (!abort.signal.aborted) {
                    setLaster(false);
                }
            });

        return () => abort.abort();
    }, [slug, debouncedQuery]);

    return { brukere, laster, feil };
}
