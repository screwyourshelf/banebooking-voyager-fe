import { Button } from "@/components/ui/button";
import Tabs from "@/components/navigation/Tabs";
import { TurneringStatusBadge, klasseTypeNavn, KlasseKampTab } from "../../components";
import type { TurneringRespons } from "@/types";
import { Section } from "@/components";

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
            <Button variant="outline" onClick={openKampplan} disabled={kampplanPending}>
              {kampplanPending ? "Genererer..." : "Generer kampplan"}
            </Button>
          ) : undefined
        }
      />
    ),
  }));

  return (
    <div>
      {/* ─── Header ─── */}
      <Section>
        <div>
          <h2>{turnering.arrangementTittel}</h2>
          <div>
            <TurneringStatusBadge status={turnering.status} />
          </div>
        </div>
      </Section>

      {/* ─── Klasse-tabs ─── */}
      {turnering.klasser.length > 0 ? (
        <Section title="Klasser">
          <Tabs items={klasseTabs} />
        </Section>
      ) : (
        <p>Ingen klasser er satt opp ennå.</p>
      )}
    </div>
  );
}
