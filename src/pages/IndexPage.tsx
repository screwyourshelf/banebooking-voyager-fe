import { useEffect, useState } from "react";
import { format } from "date-fns";
import { HelpCircle } from "lucide-react";

import DatoVelger from "../components/DatoVelger.js";
import { BookingSlotList } from "../components/Booking/BookingSlotList.js";
import { useBaner } from "../hooks/useBaner.js";
import { useBooking } from "../hooks/useBooking.js";
import { useAuth } from "../hooks/useAuth.js";
import LoaderSkeleton from "../components/LoaderSkeleton.js";
import { useSlug } from "@/hooks/useSlug.js";
import Page from "@/components/Page.js";
import SimpleTabsLazy from "@/components/SimpleTabsLazy.js";
import ReglementDialog from "@/components/ReglementDialog.js";
import { Button } from "@/components/ui/button.js";

export default function IndexPage() {
  const slug = useSlug();
  const { baner, isLoading: loadingBaner } = useBaner(slug, false);
  const [valgtBaneId, setValgtBaneId] = useState("");
  const [valgtDato, setValgtDato] = useState<Date | null>(new Date());

  const { currentUser } = useAuth();
  const valgtDatoStr = valgtDato ? format(valgtDato, "yyyy-MM-dd") : "";

  const {
    slots,
    apenSlotTid,
    setApenSlotTid,
    onBook,
    onCancel,
    onDelete,
    isLoading: loadingBooking,
  } = useBooking(slug, valgtDatoStr, valgtBaneId);

  useEffect(() => {
    if (!valgtBaneId && baner.length > 0) {
      setValgtBaneId(baner[0].id);
    }
  }, [baner, valgtBaneId]);

  useEffect(() => {
    setApenSlotTid(null);
  }, [valgtDato, valgtBaneId, setApenSlotTid]);

  useEffect(() => {
    if (!currentUser) {
      setApenSlotTid(null);
    }
  }, [currentUser, setApenSlotTid]);

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
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            title="Vis banereglement"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </ReglementDialog>
      <DatoVelger
          value={valgtDato}
          onChange={(date) => setValgtDato(date ?? null)}
          visNavigering={true}
        />

       
      </div>

      <SimpleTabsLazy
        items={baner.map((bane) => ({
          value: bane.id,
          label: bane.navn,
          content: (
            <BookingSlotList
              slots={slots}
              currentUser={
                currentUser ? { epost: currentUser.email ?? "" } : null
              }
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
