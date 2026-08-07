import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
      await fjernAsync({
        bookingId: slot.bookingId,
      });
    } catch {
      // feil eksponeres via fjernFeil
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-6 sm:px-6 md:py-6 lg:gap-8 lg:px-8 lg:py-10">
      <header className="-mx-4 space-y-3 bg-sidebar px-4 py-6 text-sidebar-foreground sm:-mx-6 sm:px-6 md:mx-0 md:bg-transparent md:p-0">
        <Badge
          variant="outline"
          className="border-transparent bg-sidebar-accent text-sidebar-accent-foreground md:border-white/25 md:bg-white/10 md:text-white"
        >
          Min konto
        </Badge>
        <div className="space-y-1.5">
          <h1 className="font-heading text-page-title text-balance text-sidebar-foreground md:text-white">
            Mine bookinger
          </h1>
          <p className="max-w-2xl text-body text-sidebar-foreground/75 md:text-lead md:text-white/75">
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
  );
}
