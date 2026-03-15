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
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <PageSection>
        <div>
          <h2 className="text-lg font-semibold">{turnering.arrangementTittel}</h2>
          <div className="mt-1">
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
        <p className="text-sm text-muted-foreground italic">Ingen klasser er satt opp ennå.</p>
      )}
    </div>
  );
}
