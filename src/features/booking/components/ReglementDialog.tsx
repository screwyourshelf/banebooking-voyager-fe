import { useState, type ReactNode } from "react";
import { AdminEditorDialog } from "@/components/admin";
import {
  ContentDocument,
  ContentDocumentFacts,
  ContentDocumentIntro,
  ContentDocumentSection,
  type ContentDocumentFact,
} from "@/components/layout/ContentDocument";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useGrener } from "@/hooks/useGrener";
import type { GrenRespons } from "@/types";

type Props = {
  children: ReactNode;
  grenId?: string;
};

export default function ReglementDialog({ children, grenId }: Props) {
  const [open, setOpen] = useState(false);
  const { grener, isLoading, isFetching, error, refetch } = useGrener(false);
  const gren = findGren(grener, grenId);

  return (
    <AdminEditorDialog
      open={open}
      onOpenChange={setOpen}
      trigger={children}
      backLabel="Til booking"
      eyebrow="Booking"
      title={gren ? `Regler for ${gren.navn}` : "Bookingregler"}
      description="Les reglementet og grensene som gjelder før du booker."
    >
      {isLoading ? (
        <RecordListState title="Laster bookingreglene…" />
      ) : error ? (
        <RecordListState
          title="Kunne ikke laste bookingreglene"
          description={error.message}
          tone="danger"
          role="alert"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Prøver igjen…" : "Prøv igjen"}
            </Button>
          }
        />
      ) : gren ? (
        <ReglementContent gren={gren} />
      ) : (
        <RecordListState
          title="Ingen regler å vise"
          description="Det finnes ingen aktiv gren for dette banevalget."
        />
      )}
    </AdminEditorDialog>
  );
}

function ReglementContent({ gren }: { gren: GrenRespons }) {
  return (
    <ContentDocument>
      <ContentDocumentIntro>{getReglementIntro(gren)}</ContentDocumentIntro>

      <ContentDocumentSection title="Bookinggrenser">
        <ContentDocumentFacts items={getBookingLimitFacts(gren)} />
      </ContentDocumentSection>

      <ContentDocumentSection title="Tid og varighet">
        <ContentDocumentFacts items={getTimeFacts(gren)} />
      </ContentDocumentSection>
    </ContentDocument>
  );
}

function findGren(grener: GrenRespons[], grenId?: string) {
  return grenId ? grener.find((gren) => gren.id === grenId) : grener[0];
}

function getReglementIntro(gren: GrenRespons) {
  return (
    gren.banereglement.trim() ||
    `Disse standardreglene gjelder for booking av ${gren.navn.toLocaleLowerCase("nb-NO")}.`
  );
}

function getBookingLimitFacts(gren: GrenRespons): ContentDocumentFact[] {
  const { maksPerDag, maksTotalt, dagerFremITid } = gren.bookingInnstillinger;

  return [
    { label: "Per dag", value: `Maks ${formatCount(maksPerDag, "booking", "bookinger")}` },
    {
      label: "Aktive totalt",
      value: `Maks ${formatCount(maksTotalt, "booking", "bookinger")}`,
    },
    { label: "Frem i tid", value: `Opptil ${formatCount(dagerFremITid, "dag", "dager")}` },
  ];
}

function getTimeFacts(gren: GrenRespons): ContentDocumentFact[] {
  const { aapningstid, stengetid, slotLengdeMinutter } = gren.bookingInnstillinger;

  return [
    { label: "Åpningstid", value: `${aapningstid}–${stengetid}` },
    { label: "Varighet", value: `${slotLengdeMinutter} minutter per booking` },
  ];
}

function formatCount(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}
