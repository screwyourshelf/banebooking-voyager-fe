import { useState, type ReactNode } from "react";
import { AdminEditorDialog } from "@/components/admin";
import {
  ContentDocument,
  ContentDocumentFacts,
  ContentDocumentSection,
  type ContentDocumentFact,
} from "@/components/layout/ContentDocument";
import type { BaneRespons, GrenRespons } from "@/types";
import type { BookingRegelRespons } from "@/types/Klubbdetaljer";

type Props = {
  children: ReactNode;
  gren?: GrenRespons;
  bane?: BaneRespons;
};

export default function ReglementDialog({ children, gren, bane }: Props) {
  const [open, setOpen] = useState(false);
  const bookingRegler = resolveBookingRegler(gren, bane);
  const title = bane
    ? `Bookingregler for ${bane.navn}`
    : gren
      ? `Bookingregler for ${gren.navn}`
      : "Bookingregler";

  return (
    <AdminEditorDialog
      open={open}
      onOpenChange={setOpen}
      trigger={children}
      backLabel="Til booking"
      eyebrow="Booking"
      title={title}
      description="Se grensene, tidene og varigheten som gjelder når du booker."
      size="compact"
    >
      {gren && bookingRegler ? (
        <ReglementContent gren={gren} bookingRegler={bookingRegler} />
      ) : null}
    </AdminEditorDialog>
  );
}

function ReglementContent({
  gren,
  bookingRegler,
}: {
  gren: GrenRespons;
  bookingRegler: BookingRegelRespons;
}) {
  return (
    <ContentDocument>
      <ContentDocumentSection
        title="Hvor mye du kan booke"
        description={`Dette gjelder når du booker ${gren.navn.toLocaleLowerCase("nb-NO")}.`}
      >
        <ContentDocumentFacts items={getBookingLimitFacts(bookingRegler)} />
      </ContentDocumentSection>

      <ContentDocumentSection title="Når du kan booke">
        <ContentDocumentFacts items={getTimeFacts(bookingRegler)} />
      </ContentDocumentSection>
    </ContentDocument>
  );
}

function getBookingLimitFacts(regler: BookingRegelRespons): ContentDocumentFact[] {
  const { maksPerDag, maksTotalt, dagerFremITid } = regler;

  return [
    { label: "Per dag", value: `Maks ${formatCount(maksPerDag, "booking", "bookinger")}` },
    {
      label: "Aktive totalt",
      value: `Maks ${formatCount(maksTotalt, "booking", "bookinger")}`,
    },
    { label: "Frem i tid", value: `Opptil ${formatCount(dagerFremITid, "dag", "dager")}` },
  ];
}

function getTimeFacts(regler: BookingRegelRespons): ContentDocumentFact[] {
  const { aapningstid, stengetid, slotLengdeMinutter } = regler;

  return [
    { label: "Åpningstid", value: `${aapningstid}–${stengetid}` },
    { label: "Varighet", value: `${slotLengdeMinutter} minutter per booking` },
  ];
}

function resolveBookingRegler(gren?: GrenRespons, bane?: BaneRespons): BookingRegelRespons | null {
  const standard = bane?.bookingInnstillinger ?? gren?.bookingInnstillinger;
  if (!standard) return null;

  const overstyring = bane?.bookingOverstyring;
  if (!overstyring) return standard;

  return {
    aapningstid: overstyring.aapningstid ?? standard.aapningstid,
    stengetid: overstyring.stengetid ?? standard.stengetid,
    maksPerDag: overstyring.maksPerDag ?? standard.maksPerDag,
    maksTotalt: overstyring.maksTotalt ?? standard.maksTotalt,
    dagerFremITid: overstyring.dagerFremITid ?? standard.dagerFremITid,
    slotLengdeMinutter: overstyring.slotLengdeMinutter ?? standard.slotLengdeMinutter,
  };
}

function formatCount(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}
