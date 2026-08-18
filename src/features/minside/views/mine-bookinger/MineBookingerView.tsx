import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useMineBookinger } from "@/features/minside/hooks/useMineBookinger";
import { useBookingActions } from "@/features/minside/hooks/useBookingActions";
import type { MinBookingRespons } from "@/types";
import { brandedPageStyles } from "@/styles/recipes";

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
      await fjernAsync({
        bookingId: slot.bookingId,
      });
    } catch {
      // feil eksponeres via fjernFeil
    }
  }

  return (
    <div className={brandedPageStyles.frame}>
      <div className="flex flex-col gap-6 md:gap-0 md:overflow-hidden md:rounded-t-3xl md:bg-card">
        <header className="-mx-4 space-y-3 bg-sidebar px-4 py-6 text-sidebar-foreground sm:-mx-6 sm:px-6 md:mx-0 md:px-8 md:py-8">
          <Badge variant="outline" className={brandedPageStyles.badge}>
            Min konto
          </Badge>
          <div className="space-y-1.5">
            <h1 className={brandedPageStyles.title}>Mine bookinger</h1>
            <p className={brandedPageStyles.description}>
              Hold oversikt over kommende og gjennomførte tider.
            </p>
          </div>
        </header>

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
    </div>
  );
}
