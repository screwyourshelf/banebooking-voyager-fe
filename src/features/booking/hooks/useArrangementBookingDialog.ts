import { useState } from "react";
import type { AktivtArrangementRespons } from "@/types";
import { useAktiveArrangementer } from "./useAktiveArrangementer";

type Params = {
  valgtId: string | null;
  onVelg: (id: string | null, tittel?: string) => void;
};

export function useArrangementBookingDialog({ valgtId, onVelg }: Params) {
  const [open, setOpen] = useState(false);
  const [valgtArrangementId, setValgtArrangementId] = useState<string | null>(valgtId);
  const arrangementQuery = useAktiveArrangementer(open);

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setValgtArrangementId(valgtId);
    }
    setOpen(isOpen);
  }

  function handleArrangementChange(arrangementId: string) {
    setValgtArrangementId(arrangementId);
  }

  function handleSubmit() {
    if (!valgtArrangementId) return;

    const valgtArrangement = findArrangement(arrangementQuery.data, valgtArrangementId);
    onVelg(valgtArrangementId, valgtArrangement?.tittel);
    setOpen(false);
  }

  return {
    open,
    valgtArrangementId,
    arrangementer: arrangementQuery.data ?? [],
    isLoading: arrangementQuery.isLoading,
    isFetching: arrangementQuery.isFetching,
    error: arrangementQuery.error,
    refetch: arrangementQuery.refetch,
    handleOpenChange,
    handleArrangementChange,
    handleSubmit,
  };
}

function findArrangement(
  arrangementer: AktivtArrangementRespons[] | undefined,
  arrangementId: string
) {
  return arrangementer?.find((arrangement) => arrangement.id === arrangementId);
}
