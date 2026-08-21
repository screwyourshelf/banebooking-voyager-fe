import type { ReactNode } from "react";
import Tabs from "@/components/navigation/Tabs";
import { TurneringHeaderSection } from "../../components";
import { NesteStatusKnapp } from "./NesteStatusKnapp";
import type { TurneringRespons, TurneringStatus } from "@/types";
import { Section } from "@/components";

type TabItem = { value: string; label: string; content: ReactNode };

type Props = {
  turnering: TurneringRespons;
  neste: TurneringStatus | null;
  onNesteStatus: () => void;
  nesteStatusPending: boolean;
  forrige?: TurneringStatus | null;
  onForrigeStatus?: () => void;
  klasseTabs: TabItem[];
};

export default function AdminPaameldingContent({
  turnering,
  neste,
  onNesteStatus,
  nesteStatusPending,
  forrige,
  onForrigeStatus,
  klasseTabs,
}: Props) {
  return (
    <div>
      {/* ─── Header ─── */}
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
        actions={
          neste ? (
            <NesteStatusKnapp
              neste={neste}
              onNesteStatus={onNesteStatus}
              forrige={forrige ?? undefined}
              onForrigeStatus={onForrigeStatus}
              pending={nesteStatusPending}
            />
          ) : undefined
        }
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
