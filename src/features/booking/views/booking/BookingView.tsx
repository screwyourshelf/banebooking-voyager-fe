import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";

import LoaderSkeleton from "@/components/LoaderSkeleton";
import { useBaner } from "@/hooks/useBaner";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { useAuth } from "@/hooks/useAuth";

import BookingContent from "./BookingContent";

export default function BookingView() {
  const { baner, isLoading: loadingBaner } = useBaner(false);
  const [valgtBaneId, setValgtBaneId] = useState("");
  const [valgtDato, setValgtDato] = useState<Date | null>(new Date());

  const { currentUser } = useAuth();

  // Stabil dato-streng (endres kun når valgtDato endres)
  const valgtDatoStr = useMemo(
    () => (valgtDato ? format(valgtDato, "yyyy-MM-dd") : ""),
    [valgtDato]
  );

  const {
    slots,
    apenSlotTid,
    setApenSlotTid,
    onBook,
    onCancel,
    onDelete,
    isLoading: loadingBooking,
  } = useBooking(valgtDatoStr, valgtBaneId);

  // Sett default bane
  useEffect(() => {
    if (!valgtBaneId && baner.length > 0) {
      setValgtBaneId(baner[0].id);
    }
  }, [baner, valgtBaneId]);

  // Lukk slot-popup når bane/dato endres
  useEffect(() => {
    setApenSlotTid(null);
  }, [valgtDato, valgtBaneId, setApenSlotTid]);

  // Lukk slot-popup når bruker logger ut
  useEffect(() => {
    if (!currentUser) {
      setApenSlotTid(null);
    }
  }, [currentUser, setApenSlotTid]);

  // Husk valgtDato i localStorage
  useEffect(() => {
    if (valgtDato) {
      localStorage.setItem("valgtDato", valgtDato.toISOString());
    }
  }, [valgtDato]);

  if (loadingBaner || !valgtBaneId) {
    return <LoaderSkeleton />;
  }

  return (
    <BookingContent
      baner={baner}
      valgtBaneId={valgtBaneId}
      onBaneChange={setValgtBaneId}
      valgtDato={valgtDato}
      onDatoChange={setValgtDato}
      slots={slots}
      isLoading={loadingBooking}
      currentUser={currentUser}
      apenSlotTid={apenSlotTid}
      setApenSlotTid={setApenSlotTid}
      onBook={onBook}
      onCancel={onCancel}
      onDelete={onDelete}
    />
  );
}
