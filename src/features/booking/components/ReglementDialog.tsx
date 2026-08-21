import { type ReactNode } from "react";
import { Dialog, Document, Section, Settings } from "@/components";

import type { BaneRespons, GrenRespons } from "@/types";
import type { BookingRegelRespons } from "@/types/Klubbdetaljer";

type Props = {
  children: ReactNode;
  gren?: GrenRespons;
  bane?: BaneRespons;
};

type Fact = { label: string; value: string };

export default function ReglementDialog({ children, gren, bane }: Props) {
  const bookingRegler = resolveBookingRegler(gren, bane);
  const title = bane
    ? `Bookingregler for ${bane.navn}`
    : gren
      ? `Bookingregler for ${gren.navn}`
      : "Bookingregler";

  return (
    <Dialog
      trigger={children}
      title={title}
      description="Grenser, tider og varighet som gjelder når du booker."
    >
      {gren && bookingRegler ? (
        <Settings.Stack>
          <Section
            title="Hvor mye du kan booke"
            description={`Gjelder ${gren.navn.toLocaleLowerCase("nb-NO")}.`}
            variant="plain"
            padding="sm"
          >
            <Document.Facts items={getBookingLimitFacts(bookingRegler)} />
          </Section>
          <Section title="Når du kan booke" variant="plain" padding="sm">
            <Document.Facts items={getTimeFacts(bookingRegler)} />
          </Section>
        </Settings.Stack>
      ) : null}
    </Dialog>
  );
}

function getBookingLimitFacts(regler: BookingRegelRespons): Fact[] {
  const { maksPerDag, maksTotalt, dagerFremITid } = regler;

  return [
    { label: "Per dag", value: `Maks ${formatCount(maksPerDag, "booking", "bookinger")}` },
    { label: "Aktive totalt", value: `Maks ${formatCount(maksTotalt, "booking", "bookinger")}` },
    { label: "Frem i tid", value: `Opptil ${formatCount(dagerFremITid, "dag", "dager")}` },
  ];
}

function getTimeFacts(regler: BookingRegelRespons): Fact[] {
  const { aapningstid, stengetid, slotLengdeMinutter } = regler;

  return [
    { label: "Åpningstid", value: `${aapningstid}–${stengetid}` },
    { label: "Varighet", value: `${slotLengdeMinutter} minutter` },
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
