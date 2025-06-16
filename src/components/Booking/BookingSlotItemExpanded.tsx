import { BookingActions } from './BookingActions.js';
import type { BookingSlot } from '../../types/index.js';

type Props = {
    slot: BookingSlot;
    time: string;
    erBekreftet: boolean;
    setErBekreftet: (val: boolean) => void;
    onBook: (slot: BookingSlot) => void;
    onCancel: (slot: BookingSlot) => void;
    onDelete: (slot: BookingSlot) => void;
    reset: () => void;
};

export function BookingSlotItemExpanded({
    slot,
    time,
    erBekreftet,
    setErBekreftet,
    onBook,
    onCancel,
    onDelete,
    reset,
}: Props) {
    return (
        <div className="mt-1">
            <div className="bg-inherit">
                <BookingActions
                    slot={slot}
                    time={time}
                    erBekreftet={erBekreftet}
                    setErBekreftet={setErBekreftet}
                    onBook={onBook}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    reset={reset}
                />
            </div>
        </div>
    );
}
