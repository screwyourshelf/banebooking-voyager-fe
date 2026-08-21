import { useMemo, useState } from "react";
import { Page } from "@/components";

import { useMineBookinger } from "@/features/minside/hooks/useMineBookinger";
import { useBookingActions } from "@/features/minside/hooks/useBookingActions";
import type { MinBookingRespons } from "@/types";

import MineBookingerContent from "./MineBookingerContent";
import { sortBookingerEtterRelevans } from "./bookingSort";

export default function MineBookingerView() {
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
    return sortBookingerEtterRelevans(bookinger);
  }, [bookinger]);

  async function handleFjern(slot: MinBookingRespons) {
    if (isPending || !slot.bookingId) return;

    try {
      await fjernAsync({ bookingId: slot.bookingId });
    } catch {
      // Feilen eksponeres via fjernFeil.
    }
  }

  return (
    <Page
      eyebrow="Min konto"
      title="Mine bookinger"
      description="Hold oversikt over kommende og gjennomførte tider."
    >
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
    </Page>
  );
}
