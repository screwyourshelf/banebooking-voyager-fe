import { useMemo, useState } from "react";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import { useMineBookinger } from "@/features/minside/hooks/useMineBookinger";
import { useBookingActions } from "@/features/minside/hooks/useBookingActions";
import type { MinBookingRespons } from "@/types";
import "animate.css";

import MineBookingerContent from "./MineBookingerContent";
import { sortBookingerNyesteFoerst } from "./bookingSort";

export default function MineBookingerTab() {
  const [visHistoriske, setVisHistoriske] = useState(false);

  const {
    data: bookinger = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useMineBookinger(visHistoriske);
  const { avbestillAsync, isPending } = useBookingActions();

  const visteBookinger = useMemo(() => {
    return sortBookingerNyesteFoerst(bookinger);
  }, [bookinger]);

  async function handleAvbestill(slot: MinBookingRespons) {
    if (isPending || !slot.bookingId) return;

    await avbestillAsync({
      bookingId: slot.bookingId,
    });
  }

  if (isLoading) return <ListSkeleton />;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <MineBookingerContent
        visHistoriske={visHistoriske}
        onToggleVisHistoriske={setVisHistoriske}
        bookinger={visteBookinger}
        isPending={isPending}
        onAvbestill={handleAvbestill}
      />
    </QueryFeil>
  );
}
