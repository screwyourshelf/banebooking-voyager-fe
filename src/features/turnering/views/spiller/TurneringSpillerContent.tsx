import type { ReactNode } from "react";
import PageSection from "@/components/sections/PageSection";
import Tabs from "@/components/navigation/Tabs";
import { TurneringHeaderSection } from "../../components";
import type { TurneringRespons } from "@/types";

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
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        beskrivelse={turnering.arrangementBeskrivelse}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
      />

      {turnering.status === "Oppsett" && (
        <PageSection>
          <p className="text-sm text-muted-foreground italic">Påmelding åpner snart.</p>
        </PageSection>
      )}

      {(visPaamelding || visDrawFaser) && klasseTabs.length > 0 && (
        <PageSection title="Klasser">
          <Tabs items={klasseTabs} />
        </PageSection>
      )}

      {(visPaamelding || visDrawFaser) && klasseTabs.length === 0 && (
        <PageSection>
          <p className="text-sm text-muted-foreground italic">Ingen klasser er satt opp.</p>
        </PageSection>
      )}
    </div>
  );
}
