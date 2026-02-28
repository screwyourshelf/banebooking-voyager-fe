import { useMemo, useState } from "react";
import { LoaderSkeleton } from "@/components/loading";
import { useMineBookinger } from "@/features/minside/hooks/useMineBookinger";
import { useBookingActions } from "@/features/minside/hooks/useBookingActions";
import type { BookingSlotRespons } from "@/types";
import "animate.css";

import MineBookingerContent from "./MineBookingerContent";
import { sortBookingerNyesteFoerst } from "./bookingSort";

export default function MineBookingerTab() {
  const [visHistoriske, setVisHistoriske] = useState(false);

  const { data: bookinger = [], isLoading } = useMineBookinger(visHistoriske);
  const { avbestillAsync, isPending } = useBookingActions();

  const visteBookinger = useMemo(() => {
    return sortBookingerNyesteFoerst(bookinger);
  }, [bookinger]);

  async function handleAvbestill(slot: BookingSlotRespons) {
    if (isPending) return;

    await avbestillAsync({
      baneId: slot.baneId,
      dato: slot.dato,
      startTid: slot.startTid,
      sluttTid: slot.sluttTid,
    });
  }

  if (isLoading) return <LoaderSkeleton />;

  return (
    <MineBookingerContent
      visHistoriske={visHistoriske}
      onToggleVisHistoriske={setVisHistoriske}
      bookinger={visteBookinger}
      isPending={isPending}
      onAvbestill={handleAvbestill}
    />
  );
}
