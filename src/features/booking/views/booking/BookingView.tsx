import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";

import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import { useBaner } from "@/hooks/useBaner";
import { useGrener } from "@/hooks/useGrener";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { useSlotArrangementPaamelding } from "@/features/booking/hooks/useSlotArrangementPaamelding";
import { useAuth } from "@/hooks/useAuth";

import BookingContent from "./BookingContent";

export default function BookingView() {
  const { grener, isLoading: loadingGrener } = useGrener(false);
  const { baner, isLoading: loadingBaner } = useBaner(false);
  const [valgtGrenId, setValgtGrenId] = useState("");
  const [valgtBaneId, setValgtBaneId] = useState("");
  const [valgtDato, setValgtDato] = useState<Date | null>(new Date());

  const { currentUser } = useAuth();

  const valgtDatoStr = useMemo(
    () => (valgtDato ? format(valgtDato, "yyyy-MM-dd") : ""),
    [valgtDato]
  );

  const filtrerteBaner = useMemo(
    () => (valgtGrenId ? baner.filter((b) => b.grenId === valgtGrenId) : baner),
    [baner, valgtGrenId]
  );

  // Synkron beregning av gyldig baneId — unngår stale request før effect kjører
  const gyldigBaneId = useMemo(
    () => (filtrerteBaner.some((b) => b.id === valgtBaneId) ? valgtBaneId : ""),
    [filtrerteBaner, valgtBaneId]
  );

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
  } = useBooking(valgtDatoStr, gyldigBaneId);

  const { onMeldPaa, onMeldAv, paameldingFeil, avmeldingFeil } = useSlotArrangementPaamelding(
    valgtDatoStr,
    gyldigBaneId
  );

  const serverFeil =
    bookFeil?.message ??
    fjernFeil?.message ??
    paameldingFeil?.message ??
    avmeldingFeil?.message ??
    null;

  // Velg første gren som default
  useEffect(() => {
    if (!valgtGrenId && grener.length > 0) {
      setValgtGrenId(grener[0].id);
    }
  }, [grener, valgtGrenId]);

  // Når gren endres → velg første bane i filtrert liste
  useEffect(() => {
    const banerForGren = valgtGrenId ? baner.filter((b) => b.grenId === valgtGrenId) : baner;
    if (!banerForGren.some((b) => b.id === valgtBaneId) && banerForGren.length > 0) {
      setValgtBaneId(banerForGren[0].id);
    }
  }, [baner, valgtGrenId, valgtBaneId]);

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
        currentUser={currentUser}
        onBook={onBook}
        onFjern={onFjern}
        onMeldPaa={onMeldPaa}
        onMeldAv={onMeldAv}
        serverFeil={serverFeil}
      />
    </QueryFeil>
  );
}
