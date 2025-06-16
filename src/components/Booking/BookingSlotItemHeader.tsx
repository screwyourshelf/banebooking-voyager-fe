import { FaChevronDown } from 'react-icons/fa';
import type { BookingSlot } from '../../types/index.js';
import { useEffect, useState } from 'react';

type Props = {
    slot: BookingSlot;
    isOpen: boolean;
    erInteraktiv: boolean;
};

export function BookingSlotItemHeader({ slot, isOpen, erInteraktiv }: Props) {
    const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
    const harArrangement = !!slot.arrangementTittel;

    const [erMobil, setErMobil] = useState(false);

    useEffect(() => {
        const sjekkBredde = () => setErMobil(window.innerWidth < 640); // Tailwind breakpoint for "sm"
        sjekkBredde();
        window.addEventListener('resize', sjekkBredde);
        return () => window.removeEventListener('resize', sjekkBredde);
    }, []);

    const maksLengde = 40;
    const beskrivelse =
        slot.arrangementBeskrivelse && erMobil && slot.arrangementBeskrivelse.length > maksLengde
            ? slot.arrangementBeskrivelse.slice(0, maksLengde) + '...'
            : slot.arrangementBeskrivelse;

    return (
        <div className="flex items-center">
            <div className="flex flex-1 items-center justify-between">
                {/* Tid */}
                <div className="whitespace-nowrap font-semibold text-sm text-right pr-1">
                    {tid}
                </div>

                {/* Værikon */}
                <div className="w-[18px] h-[18px] flex items-center justify-center">
                    {slot.værSymbol ? (
                        <img
                            src={`${import.meta.env.BASE_URL}weather-symbols/svg/${slot.værSymbol}.svg`}
                            alt={slot.værSymbol}
                            width={18}
                            height={18}
                            className="select-none"
                            draggable={false}
                        />
                    ) : (
                        <span className="invisible"></span> // eller <div className="invisible w-[16px] h-[16px]" />
                    )}
                </div>

                {/* Tittel + ev. beskrivelse */}
                <div className="flex-grow text-sm p-1">
                    {harArrangement ? (
                        <div>
                            <div className="font-medium">{slot.arrangementTittel}</div>
                            {beskrivelse && (
                                <div className="text-xs text-gray-600">{beskrivelse}</div>
                            )}
                        </div>
                    ) : (
                        <div>{slot.booketAv ?? 'Ledig'}</div>
                    )}
                </div>

                {/* Pilindikator */}
                {erInteraktiv && (
                    <div className="p-1">
                        <FaChevronDown
                            size={12}
                            style={{
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                            }}
                            aria-hidden="true"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
