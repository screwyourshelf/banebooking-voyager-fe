import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { BrukerDto } from '../types/index.js';
import { hentAlleBrukere, oppdaterBruker } from '../api/adminBruker.js';

export function useAdminBrukere(slug?: string) {
    const [brukere, setBrukere] = useState<BrukerDto[]>([]);
    const [laster, setLaster] = useState(false);

    const hent = useCallback(async () => {
        if (!slug) return;
        setLaster(true);
        try {
            const data = await hentAlleBrukere(slug);
            setBrukere(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Kunne ikke hente brukere.');
            setBrukere([]);
        } finally {
            setLaster(false);
        }
    }, [slug]);

    useEffect(() => {
        hent();
    }, [hent]);

    const oppdater = useCallback(
        async (id: string, data: { rolle: string; visningsnavn: string }) => {
            if (!slug) return;
            const toastId = toast.loading('Lagrer endringer...');
            try {
                await oppdaterBruker(slug, id, data);
                toast.success('Bruker oppdatert', { id: toastId });
                await hent();
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : 'Kunne ikke oppdatere bruker',
                    { id: toastId }
                );
            }
        },
        [slug, hent]
    );

    return { brukere, laster, oppdater, hentBrukere: hent };
}
