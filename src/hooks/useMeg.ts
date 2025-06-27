import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { hentMeg, oppdaterMeg, slettMeg as slettMegApi } from '../api/meg.js';
import type { BrukerDto } from '../types/index.js';

export function useMeg(slug?: string) {
    const [bruker, setBruker] = useState<BrukerDto | null>(null);
    const [laster, setLaster] = useState(true);
    const [feil, setFeil] = useState<string | null>(null);

    const hent = useCallback(async () => {
        if (!slug) return;

        setLaster(true);
        try {
            const data = await hentMeg(slug);
            setBruker(data);
            setFeil(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ukjent feil ved henting';
            setFeil(message);
            toast.error(message);
            setBruker(null);
        } finally {
            setLaster(false);
        }
    }, [slug]);

    const oppdaterVisningsnavn = useCallback(
        async (visningsnavn: string) => {
            if (!bruker || !slug) return;

            try {
                await oppdaterMeg(slug, { visningsnavn });
                setBruker({ ...bruker, visningsnavn });
                toast.success('Visningsnavn lagret');
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Kunne ikke lagre visningsnavn';
                toast.error(message);
            }
        },
        [slug, bruker]
    );

    const slettMeg = useCallback(async () => {
        if (!slug) return;

        try {
            await slettMegApi(slug);
            setBruker(null);
            toast.success('Brukeren er slettet');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Kunne ikke slette bruker';
            toast.error(message);
        }
    }, [slug]);

    useEffect(() => {
        hent();
    }, [hent]);

    return {
        bruker,
        laster,
        feil,
        oppdaterVisningsnavn,
        refetch: hent,
        slettMeg,
    }
}
