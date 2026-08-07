import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">{title}</DialogTitle>
          <DialogDescription>
            Grenser, tider og varighet som gjelder når du booker.
          </DialogDescription>
        </DialogHeader>

        {gren && bookingRegler ? (
          <div className="space-y-6 pt-2">
            <RuleSection
              title="Hvor mye du kan booke"
              description={`Gjelder ${gren.navn.toLocaleLowerCase("nb-NO")}.`}
              facts={getBookingLimitFacts(bookingRegler)}
            />
            <Separator />
            <RuleSection title="Når du kan booke" facts={getTimeFacts(bookingRegler)} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RuleSection({
  title,
  description,
  facts,
}: {
  title: string;
  description?: string;
  facts: Fact[];
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <dl className="grid gap-3 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-2xl bg-muted/60 p-4">
            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
            <dd className="mt-1 font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
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
