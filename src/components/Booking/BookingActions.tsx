import { Button } from '@/components/ui/button.js';
import { Checkbox } from '@/components/ui/checkbox.js';
import { FaCalendarPlus, FaTimesCircle, FaTrashAlt } from 'react-icons/fa';
import type { BookingSlot } from '../../types/index.js';

type Props = {
    slot: BookingSlot;
    onBook?: (slot: BookingSlot) => void;
    onCancel?: (slot: BookingSlot) => void;
    onDelete?: (slot: BookingSlot) => void;
    time?: string;
    erBekreftet?: boolean;
    setErBekreftet?: (val: boolean) => void;
    reset?: () => void;
};

export function BookingActions({
    slot,
    onBook = () => { },
    onCancel = () => { },
    onDelete = () => { },
    time,
    erBekreftet,
    setErBekreftet,
    reset = () => { },
}: Props) {
    return (
        <div className="flex flex-col items-end w-full">
            {slot.kanBookes && erBekreftet !== undefined && setErBekreftet && (
                <>
                    <div className="flex items-center space-x-1 mb-2 text-sm">
                        <Checkbox
                            id={`book-${time}`}
                            checked={erBekreftet}
                            onCheckedChange={(checked) => setErBekreftet(!!checked)}
                        />
                        <label htmlFor={`book-${time}`} className="cursor-pointer select-none">
                            Jeg (og de jeg spiller sammen med) har betalt medlemskap for {new Date().getFullYear()}
                        </label>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!erBekreftet}
                        onClick={() => {
                            onBook(slot);
                            reset();
                        }}
                        className="flex items-center gap-2 text-sm"
                    >
                        <FaCalendarPlus />
                        Book
                    </Button>
                </>
            )}

            {slot.kanAvbestille && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        onCancel(slot);
                        reset();
                    }}
                    className="flex items-center gap-2 text-sm"
                >
                    <FaTimesCircle />
                    Avbestill
                </Button>
            )}

            {slot.kanSlette && (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                        onDelete(slot);
                        reset();
                    }}
                    className="flex items-center gap-2 text-sm"
                >
                    <FaTrashAlt />
                    Slett
                </Button>
            )}
        </div>
    );
}
