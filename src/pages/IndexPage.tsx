import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { HelpCircle } from "lucide-react";

import DatoVelger from "../components/DatoVelger";
import { BookingSlotList } from "../components/Booking/BookingSlotList";
import { useBaner } from "../hooks/useBaner";
import { useBooking } from "../hooks/useBooking";
import { useAuth } from "../hooks/useAuth";
import LoaderSkeleton from "../components/LoaderSkeleton";
import Page from "@/components/Page";
import { TabsLazyMount } from "@/components/navigation";
import ReglementDialog from "@/components/ReglementDialog";
import { Button } from "@/components/ui/button";

export default function IndexPage() {
  const { baner, isLoading: loadingBaner } = useBaner(false);
  const [valgtBaneId, setValgtBaneId] = useState("");
  const [valgtDato, setValgtDato] = useState<Date | null>(new Date());

  const { currentUser } = useAuth();

  // Stabil dato-streng (endres kun n�r valgtDato endres)
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

  // Lukk slot-popup n�r bane/dato endres
  useEffect(() => {
    setApenSlotTid(null);
  }, [valgtDato, valgtBaneId, setApenSlotTid]);

  // Lukk slot-popup n�r bruker logger ut
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
    <Page>
      <div className="flex justify-between items-center mb-2">
        <ReglementDialog>
          <Button variant="ghost" size="icon" className="rounded-full" title="Vis banereglement">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </ReglementDialog>

        <DatoVelger
          value={valgtDato}
          onChange={(date) => setValgtDato(date ?? null)}
          visNavigering={true}
        />
      </div>

      <TabsLazyMount
        items={baner.map((bane) => ({
          value: bane.id,
          label: bane.navn,
          content: (
            <BookingSlotList
              slots={slots}
              currentUser={currentUser ? { epost: currentUser.email ?? "" } : null}
              apenSlotTid={apenSlotTid}
              setApenSlotTid={setApenSlotTid}
              onBook={onBook}
              onCancel={onCancel}
              onDelete={onDelete}
              isLoading={loadingBooking}
            />
          ),
        }))}
        value={valgtBaneId}
        onValueChange={setValgtBaneId}
      />
    </Page>
  );
}
