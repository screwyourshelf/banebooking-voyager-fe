import type { ReactNode } from "react";
import PageSection from "@/components/sections/PageSection";
import Tabs from "@/components/navigation/Tabs";
import { TurneringHeaderSection } from "../../components";
import { NesteStatusKnapp } from "./NesteStatusKnapp";
import type { TurneringRespons, TurneringStatus } from "@/types";

type TabItem = { value: string; label: string; content: ReactNode };

type Props = {
  turnering: TurneringRespons;
  neste: TurneringStatus | null;
  onNesteStatus: () => void;
  nesteStatusPending: boolean;
  klasseTabs: TabItem[];
};

export default function AdminKampgjennomforingContent({
  turnering,
  neste,
  onNesteStatus,
  nesteStatusPending,
  klasseTabs,
}: Props) {
  return (
    <div className="space-y-4">
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
              pending={nesteStatusPending}
            />
          ) : undefined
        }
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
