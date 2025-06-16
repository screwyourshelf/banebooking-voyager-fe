import { useBookingActions } from '../../hooks/useBookingActions.js';
import { BookingSlotItemHeader } from './BookingSlotItemHeader.js';
import { BookingSlotItemExpanded } from './BookingSlotItemExpanded.js';
import type { BookingSlot } from '../../types/index.js';

type Props = {
    slot: BookingSlot;
    currentUser: { epost: string } | null;
    isOpen?: boolean;
    onToggle?: () => void;
    onBook?: (slot: BookingSlot) => void;
    onCancel?: (slot: BookingSlot) => void;
    onDelete?: (slot: BookingSlot) => void;
};

export default function BookingSlotItem({
    slot,
    currentUser,
    isOpen = false,
    onToggle,
    onBook = () => { },
    onCancel = () => { },
    onDelete = () => { },
}: Props) {
    const { erBekreftet, setErBekreftet, reset } = useBookingActions();

    const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
    const harHandlinger = slot.kanBookes || slot.kanAvbestille || slot.kanSlette;
    const erInteraktiv = !!currentUser && harHandlinger && !slot.erPassert;
    const harArrangement = !!slot.arrangementTittel;
    const erMinBooking = slot.booketAv === currentUser?.epost;

    const className = [
        'border rounded shadow-sm p-2 mb-2',
        'transition-colors duration-300 ease-in-out',
        slot.erPassert ? 'bg-gray-100 text-gray-400' : '',
        !slot.erPassert && harArrangement
            ? 'bg-gradient-to-r from-blue-0 via-blue-50 to-blue-200 border-blue-200'
            : '',
        !slot.erPassert && !harArrangement ? 'bg-white text-gray-900' : '',
        erMinBooking && !harArrangement
            ? 'animate__animated animate__headShake animate__slow'
            : '',
    ].join(' ');

    const handleToggle = () => {
        if (erInteraktiv && onToggle) {
            onToggle();
            setErBekreftet(false);
        }
    };

    return (
        <div
            className={className}
            style={{
                cursor: erInteraktiv ? 'pointer' : 'default',
                opacity: slot.erPassert ? 0.5 : 1,
            }}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('button, input, label')) return;
                handleToggle();
            }}
            role={erInteraktiv ? 'button' : undefined}
            tabIndex={erInteraktiv ? 0 : undefined}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle();
                }
            }}
        >
            <BookingSlotItemHeader slot={slot} isOpen={isOpen} erInteraktiv={erInteraktiv} />

            {isOpen && !slot.erPassert && (
                <BookingSlotItemExpanded
                    slot={slot}
                    time={tid}
                    erBekreftet={erBekreftet}
                    setErBekreftet={setErBekreftet}
                    onBook={onBook}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    reset={reset}
                />
            )}
        </div>
    );
}
