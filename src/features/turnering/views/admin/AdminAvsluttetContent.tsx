import type { ReactNode } from "react";
import Tabs from "@/components/navigation/Tabs";
import { TurneringHeaderSection } from "../../components";
import type { TurneringRespons } from "@/types";
import { Section } from "@/components";

type TabItem = { value: string; label: string; content: ReactNode };

type Props = {
  turnering: TurneringRespons;
  klasseTabs: TabItem[];
};

export default function AdminAvsluttetContent({ turnering, klasseTabs }: Props) {
  return (
    <div>
      {/* ─── Header ─── */}
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
      />

      {/* ─── Klasse-tabs ─── */}
      {klasseTabs.length > 0 ? (
        <Section title="Klasser">
          <Tabs items={klasseTabs} />
        </Section>
      ) : (
        <Section>
          <p>Ingen klasser er satt opp ennå.</p>
        </Section>
      )}
    </div>
  );
}
