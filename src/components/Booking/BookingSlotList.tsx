import type { BookingSlotRespons } from '../../types/index.js';
import BookingSlotItem from './BookingSlotItem.js';
import LoaderSkeleton from '@/components/LoaderSkeleton.js';

type Props = {
    slots: BookingSlotRespons[];
    currentUser: { epost: string } | null;
    onBook?: (slot: BookingSlotRespons) => void;
    onCancel?: (slot: BookingSlotRespons) => void;
    onDelete?: (slot: BookingSlotRespons) => void;
    apenSlotTid?: string | null;
    setApenSlotTid?: (tid: string | null) => void;
    isLoading?: boolean;
};

export function BookingSlotList({
    slots,
    currentUser,
    onBook,
    onCancel,
    onDelete,
    apenSlotTid,
    setApenSlotTid,
    isLoading = false,
}: Props) {
    if (isLoading) return <LoaderSkeleton />;

    if (slots.length === 0) {
        return (
            <div className="text-muted text-sm italic py-4 text-center">
                Ingen bookinger eller slots � vise.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {slots.map((slot) => {
                const slotKey = `${slot.dato}-${slot.startTid}-${slot.baneId}`;

                return (
                    <BookingSlotItem
                        key={slotKey}
                        slot={slot}
                        currentUser={currentUser}
                        onBook={onBook}
                        onCancel={onCancel}
                        onDelete={onDelete}
                        isOpen={apenSlotTid === slotKey}
                        onToggle={() =>
                            setApenSlotTid?.(apenSlotTid === slotKey ? null : slotKey)
                        }
                    />
                );
            })}
        </div>
    );
}
