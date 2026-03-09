import { useState } from "react";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { TurneringStatusBadge, LeggTilKlasseDialog, klasseTypeNavn } from "../../components";
import { useOppdaterTurneringStatus } from "../../hooks/turnering/useOppdaterTurneringStatus";
import { useLeggTilKlasse } from "../../hooks/turnering/useLeggTilKlasse";
import { useFjernKlasse } from "../../hooks/turnering/useFjernKlasse";
import { useAnsvarlige } from "../../hooks/admin/useAnsvarlige";
import { useAnsvarligMutations } from "../../hooks/admin/useAnsvarligMutations";
import { nesteStatus, STATUS_LABELS } from "./adminStatusUtils";
import { Trash2, UserMinus, UserPlus } from "lucide-react";
import type { TurneringRespons, KlasseType } from "@/types";

type Props = {
  turnering: TurneringRespons;
};

export default function AdminOppsettView({ turnering }: Props) {
  const statusMutation = useOppdaterTurneringStatus(turnering.id);
  const leggTilKlasseMutation = useLeggTilKlasse(turnering.id);
  const fjernKlasseMutation = useFjernKlasse(turnering.id);
  const { data: ansvarligeData } = useAnsvarlige(turnering.id);
  const { leggTil: leggTilAnsvarlig, fjern: fjernAnsvarlig } = useAnsvarligMutations(turnering.id);

  const [leggTilKlasseOpen, setLeggTilKlasseOpen] = useState(false);
  const [nyAnsvarligBrukerId, setNyAnsvarligBrukerId] = useState("");

  const neste = nesteStatus(turnering.status);
  const eksisterendeKlasseTyper: KlasseType[] = turnering.klasser.map((k) => k.klasseType);

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <PageSection>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{turnering.arrangementTittel}</h2>
            <div className="mt-1">
              <TurneringStatusBadge status={turnering.status} />
            </div>
          </div>
          {neste && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => statusMutation.mutate({ nyStatus: neste })}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? "Oppdaterer..." : `Sett til «${STATUS_LABELS[neste]}»`}
            </Button>
          )}
        </div>
      </PageSection>

      {/* ─── Klasser ─── */}
      <PageSection
        title="Klasser"
        actions={
          <Button size="sm" onClick={() => setLeggTilKlasseOpen(true)}>
            Legg til klasse
          </Button>
        }
      >
        {turnering.klasser.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Ingen klasser lagt til.</p>
        ) : (
          <RowPanel>
            <RowList>
              {turnering.klasser.map((k) => (
                <Row
                  key={k.id}
                  title={klasseTypeNavn(k.klasseType)}
                  description={`${k.antallGodkjente} godkjent · ${k.antallSokt} søkt · ${k.antallReserve} reserve${k.foreslåttStartTid ? ` · Starter ${format(parseISO(k.foreslåttStartTid), "d. MMM 'kl.' HH:mm", { locale: nb })}` : ""}`}
                  right={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fjernKlasseMutation.mutate({ klasseId: k.id })}
                      disabled={fjernKlasseMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              ))}
            </RowList>
          </RowPanel>
        )}
      </PageSection>

      {/* ─── Resultatansvarlige ─── */}
      <PageSection title="Resultatansvarlige">
        <RowPanel>
          <RowList>
            {(ansvarligeData?.ansvarlige ?? []).map((a) => (
              <Row
                key={a.brukerId}
                title={a.navn}
                description={a.epost}
                right={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fjernAnsvarlig.mutate({ brukerId: a.brukerId })}
                    disabled={fjernAnsvarlig.isPending}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                }
              />
            ))}
            <Row title="Legg til ansvarlig">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nyAnsvarligBrukerId}
                  onChange={(e) => setNyAnsvarligBrukerId(e.target.value)}
                  placeholder="Bruker-ID"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!nyAnsvarligBrukerId.trim()) return;
                    leggTilAnsvarlig.mutate(
                      { brukerId: nyAnsvarligBrukerId.trim() },
                      { onSuccess: () => setNyAnsvarligBrukerId("") }
                    );
                  }}
                  disabled={leggTilAnsvarlig.isPending || !nyAnsvarligBrukerId.trim()}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </Row>
          </RowList>
        </RowPanel>
      </PageSection>

      {/* ─── Dialog ─── */}
      <LeggTilKlasseDialog
        open={leggTilKlasseOpen}
        onOpenChange={setLeggTilKlasseOpen}
        eksisterendeKlasser={eksisterendeKlasseTyper}
        onLeggTil={(payload) => {
          leggTilKlasseMutation.mutate(payload, {
            onSuccess: () => setLeggTilKlasseOpen(false),
          });
        }}
        isPending={leggTilKlasseMutation.isPending}
      />
    </div>
  );
}
