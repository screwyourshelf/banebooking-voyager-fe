import PageSection from "@/components/sections/PageSection";
import { Button } from "@/components/ui/button";
import Tabs from "@/components/navigation/Tabs";
import { TurneringStatusBadge, klasseTypeNavn, KlasseKampTab } from "../../components";
import type { TurneringRespons } from "@/types";

type Props = {
  turnering: TurneringRespons;
};

export default function ResultatansvarligKampView({ turnering }: Props) {
  const klasseTabs = turnering.klasser.map((klasse) => ({
    value: klasse.id,
    label: klasseTypeNavn(klasse.klasseType),
    content: (
      <KlasseKampTab
        key={klasse.id}
        turneringId={turnering.id}
        klasse={klasse}
        renderActions={({ openKampplan, harDraw, kanGenererKampplan, kampplanPending }) =>
          kanGenererKampplan && harDraw ? (
            <Button size="sm" variant="outline" onClick={openKampplan} disabled={kampplanPending}>
              {kampplanPending ? "Genererer..." : "Generer kampplan"}
            </Button>
          ) : undefined
        }
      />
    ),
  }));

  return (
    <div className="app-stack app-stack--lg">
      {/* ─── Header ─── */}
      <PageSection>
        <div>
          <h2 className="app-text-heading">{turnering.arrangementTittel}</h2>
          <div className="app-margin-top">
            <TurneringStatusBadge status={turnering.status} />
          </div>
        </div>
      </PageSection>

      {/* ─── Klasse-tabs ─── */}
      {turnering.klasser.length > 0 ? (
        <PageSection title="Klasser">
          <Tabs items={klasseTabs} />
        </PageSection>
      ) : (
        <p className="app-text-empty">Ingen klasser er satt opp ennå.</p>
      )}
    </div>
  );
}
