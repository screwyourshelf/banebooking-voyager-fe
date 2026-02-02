import { useMemo, useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import { useMineBookinger } from "@/hooks/useMineBookinger";
import { useBookingActions } from "@/hooks/useBookingActions";
import type { BookingSlot } from "@/types";
import "animate.css";

import MineBookingerContent from "./MineBookingerContent";
import { sortBookingerNyesteFoerst } from "./bookingSort";

export default function MineBookingerTab() {
    const [visHistoriske, setVisHistoriske] = useState(false);
    const [openKey, setOpenKey] = useState<string | null>(null);

    const { data: bookinger = [], isLoading } = useMineBookinger(visHistoriske);
    const { avbestillAsync, isPending } = useBookingActions();

    const visteBookinger = useMemo(() => {
        return sortBookingerNyesteFoerst(bookinger);
    }, [bookinger]);

    async function handleAvbestill(slot: BookingSlot) {
        if (isPending) return;

        await avbestillAsync({
            baneId: slot.baneId,
            dato: slot.dato,
            startTid: slot.startTid,
            sluttTid: slot.sluttTid,
        });

        setOpenKey(null);
    }

    if (isLoading) return <LoaderSkeleton />;

    return (
        <MineBookingerContent
            visHistoriske={visHistoriske}
            onToggleVisHistoriske={(v) => {
                setVisHistoriske(v);
                setOpenKey(null);
            }}
            bookinger={visteBookinger}
            isPending={isPending}
            openKey={openKey}
            onToggleOpenKey={setOpenKey}
            onAvbestill={handleAvbestill}
        />
    );
}
