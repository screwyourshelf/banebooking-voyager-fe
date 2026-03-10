import type { ReactNode } from "react";
import PageSection from "@/components/sections/PageSection";
import Tabs from "@/components/navigation/Tabs";
import { TurneringHeaderSection } from "../../components";
import type { TurneringRespons } from "@/types";

type TabItem = { value: string; label: string; content: ReactNode };

type Props = {
  turnering: TurneringRespons;
  klasseTabs: TabItem[];
};

export default function AdminAvsluttetContent({ turnering, klasseTabs }: Props) {
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

      {/* ─── Klasse-tabs ─── */}
      {klasseTabs.length > 0 ? (
        <PageSection title="Klasser">
          <Tabs items={klasseTabs} />
        </PageSection>
      ) : (
        <PageSection>
          <p className="text-sm text-muted-foreground italic">Ingen klasser er satt opp ennå.</p>
        </PageSection>
      )}
    </div>
  );
}
