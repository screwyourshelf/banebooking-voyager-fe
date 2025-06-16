import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { BookingSlot } from '../types/index.js';
import { hentBookinger, opprettBooking, avbestillBooking } from '../api/booking.js';

export function useBooking(slug: string | undefined, valgtDato: string, valgtBaneId: string) {
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [apenSlotTid, setApenSlotTid] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const hent = useCallback(async () => {
        if (!slug || !valgtBaneId) return;

        setIsLoading(true);
        try {
            const data = await hentBookinger(slug, valgtBaneId, valgtDato);
            setSlots(data);
        } catch {
            setSlots([]);
            toast.error('Kunne ikke hente bookinger.');
        } finally {
            setIsLoading(false);
        }
    }, [slug, valgtDato, valgtBaneId]);

    useEffect(() => {
        hent();
    }, [hent]);

    const onBook = async (slot: BookingSlot) => {
        if (!slug || !valgtBaneId) return;

        try {
            await opprettBooking(slug, valgtBaneId, valgtDato, slot.startTid, slot.sluttTid);
            const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
            toast.success(`Booket ${tid}`);
            await hent();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Kunne ikke booke slot.');
        }
    };

    const onCancel = async (slot: BookingSlot) => {
        if (!slug || !valgtBaneId) return;

        try {
            await avbestillBooking(slug, valgtBaneId, valgtDato, slot.startTid, slot.sluttTid);
            toast.info('Bookingen er avbestilt.');
            await hent();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Kunne ikke avbestille slot.');
        }
    };

    return {
        slots,
        apenSlotTid,
        setApenSlotTid,
        onBook,
        onCancel,
        hentBookinger: hent,
        isLoading,
    };
}
