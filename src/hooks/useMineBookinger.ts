import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { hentMineBookinger } from '../api/booking.js';
import type { BookingSlot } from '../types/index.js';

export function useMineBookinger(slug: string | undefined) {
    const [bookinger, setBookinger] = useState<BookingSlot[]>([]);
    const [laster, setLaster] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hent = useCallback(async () => {
        if (!slug) return;

        try {
            setLaster(true);
            setError(null);
            const data = await hentMineBookinger(slug);
            setBookinger(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ukjent feil ved henting';
            setError(message);
            toast.error(message);
        } finally {
            setLaster(false);
        }
    }, [slug]);

    useEffect(() => {
        hent();
    }, [hent]);

    return {
        bookinger,
        laster,
        error,
        refetch: hent,
    };
}
