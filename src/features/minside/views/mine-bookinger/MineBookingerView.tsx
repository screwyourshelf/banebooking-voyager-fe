import { useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useMineBookinger } from "@/features/minside/hooks/useMineBookinger";
import { useBookingActions } from "@/features/minside/hooks/useBookingActions";
import type { MinBookingRespons } from "@/types";

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
  const { fjernAsync, isPending, error: fjernFeil } = useBookingActions();

  const visteBookinger = useMemo(() => {
    return sortBookingerNyesteFoerst(bookinger);
  }, [bookinger]);

  async function handleFjern(slot: MinBookingRespons) {
    if (isPending || !slot.bookingId) return;

    try {
      await fjernAsync({
        bookingId: slot.bookingId,
      });
    } catch {
      // feil eksponeres via fjernFeil
    }
  }

  return (
    <div className="mine-bookings-page">
      <PageHeader
        eyebrow="Min konto"
        title="Mine tider"
        description="Se kommende reservasjoner, finn detaljer og hold oversikt over det du har spilt."
        className="mine-bookings-page__heading"
      />

      <MineBookingerContent
        visHistoriske={visHistoriske}
        onToggleVisHistoriske={setVisHistoriske}
        bookinger={visteBookinger}
        isLoading={isLoading}
        queryError={error?.message ?? null}
        isFetching={isFetching}
        onRetry={() => void refetch()}
        isPending={isPending}
        onFjern={handleFjern}
        serverFeil={fjernFeil?.message ?? null}
      />
    </div>
  );
}
