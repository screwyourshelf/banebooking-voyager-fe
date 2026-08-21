import type { ReactNode } from "react";
import Tabs from "@/components/navigation/Tabs";
import { TurneringHeaderSection } from "../../components";
import type { TurneringRespons } from "@/types";
import { Section } from "@/components";

type TabItem = { value: string; label: string; content: ReactNode };

type Props = {
  turnering: TurneringRespons;
  klasseTabs: TabItem[];
  visPaamelding: boolean;
  visDrawFaser: boolean;
};

export default function TurneringSpillerContent({
  turnering,
  klasseTabs,
  visPaamelding,
  visDrawFaser,
}: Props) {
  return (
    <div>
      {/* ─── Header ─── */}
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
      />

      {turnering.status === "Oppsett" && (
        <Section>
          <p>Påmelding åpner snart.</p>
        </Section>
      )}

      {(visPaamelding || visDrawFaser) && klasseTabs.length > 0 && (
        <Section title="Klasser">
          <Tabs items={klasseTabs} />
        </Section>
      )}

      {(visPaamelding || visDrawFaser) && klasseTabs.length === 0 && (
        <Section>
          <p>Ingen klasser er satt opp.</p>
        </Section>
      )}
    </div>
  );
}
