import { useEffect, useState, useContext } from 'react';
import { format } from 'date-fns';
import BaneTabs from '../components/BaneTabs.js';
import DatoVelger from '../components/DatoVelger.js';
import { BookingSlotList } from '../components/Booking/BookingSlotList.js';
import { useBaner } from '../hooks/useBaner.js';
import { useBooking } from '../hooks/useBooking.js';
import { useAuth } from '../hooks/useAuth.js';
import { SlugContext } from '../layouts/Layout.js';
import LoaderSkeleton from '../components/LoaderSkeleton.js';

export default function IndexPage() {
    const { baner, isLoading: loadingBaner } = useBaner();
    const [valgtBaneId, setValgtBaneId] = useState('');
    const [valgtDato, setValgtDato] = useState<Date | null>(new Date());

    const { currentUser } = useAuth();
    const slug = useContext(SlugContext);

    const valgtDatoStr = valgtDato ? format(valgtDato, 'yyyy-MM-dd') : '';

    const {
        slots,
        apenSlotTid,
        setApenSlotTid,
        onBook,
        onCancel,
        isLoading: loadingBooking,
    } = useBooking(slug, valgtDatoStr, valgtBaneId);

    useEffect(() => {
        if (!valgtBaneId && baner.length > 0) {
            setValgtBaneId(baner[0].id);
        }
    }, [baner, valgtBaneId]);

    useEffect(() => {
        setApenSlotTid(null);
    }, [valgtDato, valgtBaneId, setApenSlotTid]);

    useEffect(() => {
        if (!currentUser) {
            setApenSlotTid(null);
        }
    }, [currentUser, setApenSlotTid]);

    useEffect(() => {
        if (valgtDato) {
            localStorage.setItem('valgtDato', valgtDato.toISOString());
        }
    }, [valgtDato]);

    if (loadingBaner || !valgtBaneId) {
        return <LoaderSkeleton />;
    }

    return (
        <div className="max-w-screen-sm mx-auto px-1 py-1">
            <div className="mb-2">
                <DatoVelger
                    value={valgtDato}
                    onChange={(date) => setValgtDato(date ?? null)}
                    visNavigering={true}
                />
            </div>

            <div className="mb-0">
                <BaneTabs
                    baner={baner}
                    valgtBaneId={valgtBaneId}
                    onVelgBane={setValgtBaneId}
                />
            </div>

            <BookingSlotList
                slots={slots}
                currentUser={currentUser ? { epost: currentUser.email ?? '' } : null}
                apenSlotTid={apenSlotTid}
                setApenSlotTid={setApenSlotTid}
                onBook={onBook}
                onCancel={onCancel}
                onDelete={(slot) => console.log('Slett', slot)}
                isLoading={loadingBooking}
            />
        </div>
    );
}
