import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";

import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import { useBaner } from "@/hooks/useBaner";
import { useGrener } from "@/hooks/useGrener";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { useAuth } from "@/hooks/useAuth";

import BookingContent from "./BookingContent";

export default function BookingView() {
  const { grener, isLoading: loadingGrener } = useGrener(false);
  const { baner, isLoading: loadingBaner } = useBaner(false);
  const [manuellGrenId, setValgtGrenId] = useState<string | null>(null);
  const [manuellBaneId, setValgtBaneId] = useState<string | null>(null);
  const [valgtDato, setValgtDato] = useState<Date | null>(new Date());

  const { currentUser } = useAuth();

  const valgtGrenId = manuellGrenId ?? grener[0]?.id ?? "";

  const valgtDatoStr = useMemo(
    () => (valgtDato ? format(valgtDato, "yyyy-MM-dd") : ""),
    [valgtDato]
  );

  const filtrerteBaner = useMemo(
    () => (valgtGrenId ? baner.filter((b) => b.grenId === valgtGrenId) : baner),
    [baner, valgtGrenId]
  );

  const valgtBaneId =
    manuellBaneId != null && filtrerteBaner.some((b) => b.id === manuellBaneId)
      ? manuellBaneId
      : (filtrerteBaner[0]?.id ?? "");

  const {
    slots,
    onBook,
    onFjern,
    isLoading: loadingBooking,
    isFetching,
    error: bookingError,
    hentBookinger,
    bookFeil,
    fjernFeil,
  } = useBooking(valgtDatoStr, valgtBaneId);

  const serverFeil =
    bookFeil?.message ??
    fjernFeil?.message ??
    null;

  useEffect(() => {
    if (valgtDato) {
      localStorage.setItem("valgtDato", valgtDato.toISOString());
    }
  }, [valgtDato]);

  if (loadingBaner || loadingGrener || !valgtBaneId) {
    return <ListSkeleton />;
  }

  return (
    <QueryFeil error={bookingError} isFetching={isFetching} onRetry={() => void hentBookinger()}>
      <BookingContent
        grener={grener}
        valgtGrenId={valgtGrenId}
        onGrenChange={setValgtGrenId}
        baner={filtrerteBaner}
        valgtBaneId={valgtBaneId}
        onBaneChange={setValgtBaneId}
        valgtDato={valgtDato}
        onDatoChange={setValgtDato}
        slots={slots}
        isLoading={loadingBooking}
        isFetching={isFetching}
        currentUser={currentUser}
        onBook={onBook}
        onFjern={onFjern}
        serverFeil={serverFeil}
      />
    </QueryFeil>
  );
}
