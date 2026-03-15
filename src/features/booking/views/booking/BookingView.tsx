import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";

import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import { useBaner } from "@/hooks/useBaner";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { useSlotArrangementPaamelding } from "@/features/booking/hooks/useSlotArrangementPaamelding";
import { useAuth } from "@/hooks/useAuth";

import BookingContent from "./BookingContent";

export default function BookingView() {
  const { baner, isLoading: loadingBaner } = useBaner(false);
  const [valgtBaneId, setValgtBaneId] = useState("");
  const [valgtDato, setValgtDato] = useState<Date | null>(new Date());

  const { currentUser } = useAuth();

  const valgtDatoStr = useMemo(
    () => (valgtDato ? format(valgtDato, "yyyy-MM-dd") : ""),
    [valgtDato]
  );

  const {
    slots,
    onBook,
    onCancel,
    onDelete,
    isLoading: loadingBooking,
    isFetching,
    error: bookingError,
    hentBookinger,
    bookFeil,
    cancelFeil,
    deleteFeil,
  } = useBooking(valgtDatoStr, valgtBaneId);

  const { onMeldPaa, onMeldAv, paameldingFeil, avmeldingFeil } = useSlotArrangementPaamelding(
    valgtDatoStr,
    valgtBaneId
  );

  const serverFeil =
    bookFeil?.message ??
    cancelFeil?.message ??
    deleteFeil?.message ??
    paameldingFeil?.message ??
    avmeldingFeil?.message ??
    null;

  useEffect(() => {
    if (!valgtBaneId && baner.length > 0) {
      setValgtBaneId(baner[0].id);
    }
  }, [baner, valgtBaneId]);

  useEffect(() => {
    if (valgtDato) {
      localStorage.setItem("valgtDato", valgtDato.toISOString());
    }
  }, [valgtDato]);

  if (loadingBaner || !valgtBaneId) {
    return <ListSkeleton />;
  }

  return (
    <QueryFeil error={bookingError} isFetching={isFetching} onRetry={() => void hentBookinger()}>
      <BookingContent
        baner={baner}
        valgtBaneId={valgtBaneId}
        onBaneChange={setValgtBaneId}
        valgtDato={valgtDato}
        onDatoChange={setValgtDato}
        slots={slots}
        isLoading={loadingBooking}
        currentUser={currentUser}
        onBook={onBook}
        onCancel={onCancel}
        onDelete={onDelete}
        onMeldPaa={onMeldPaa}
        onMeldAv={onMeldAv}
        serverFeil={serverFeil}
      />
    </QueryFeil>
  );
}
