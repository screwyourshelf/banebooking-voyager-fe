import { useState } from "react";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Tabs from "@/components/navigation/Tabs";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import {
  TurneringStatusBadge,
  klasseTypeNavn,
  MeldPaaDialog,
  PaameldingStatusBadge,
  PaameldingStatusDialog,
  SeedDialog,
  GenererDrawDialog,
} from "../../components";
import { useOppdaterTurneringStatus } from "../../hooks/turnering/useOppdaterTurneringStatus";
import { usePaameldinger } from "../../hooks/paamelding/usePaameldinger";
import { useMeldPaaKlasse } from "../../hooks/paamelding/useMeldPaaKlasse";
import { useTrekkPaamelding } from "../../hooks/paamelding/useTrekkPaamelding";
import { useOppdaterPaameldingStatus } from "../../hooks/paamelding/useOppdaterPaameldingStatus";
import { useOppdaterPaameldingSeed } from "../../hooks/paamelding/useOppdaterPaameldingSeed";
import { useGenererDraw } from "../../hooks/draw/useGenererDraw";
import { nesteStatus, STATUS_LABELS } from "./adminStatusUtils";
import type { TurneringRespons, TurneringKlasseRespons, PaameldingStatus } from "@/types";

const UGYLDIGE_STATUSER: PaameldingStatus[] = ["Avslatt", "TrukketSeg"];

type KlasseTabProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
  turneringStatus: TurneringRespons["status"];
};

function AdminPaameldingKlasseTab({ turneringId, klasse, turneringStatus }: KlasseTabProps) {
  const { data, isLoading, error, refetch, isFetching } = usePaameldinger(turneringId, klasse.id);
  const trekkMutation = useTrekkPaamelding(turneringId, klasse.id);
  const meldPaaMutation = useMeldPaaKlasse(turneringId, klasse.id);
  const statusMutation = useOppdaterPaameldingStatus(turneringId, klasse.id);
  const seedMutation = useOppdaterPaameldingSeed(turneringId, klasse.id);
  const genererDrawMutation = useGenererDraw(turneringId, klasse.id);

  const [meldPaaDialogOpen, setMeldPaaDialogOpen] = useState(false);
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [statusDialogForId, setStatusDialogForId] = useState<string | null>(null);
  const [seedDialogForId, setSeedDialogForId] = useState<string | null>(null);

  if (isLoading) return <ListSkeleton />;

  const aktivePaameldinger =
    data?.paameldinger.filter((p) => !UGYLDIGE_STATUSER.includes(p.status)) ?? [];

  const paameldingForStatusDialog = statusDialogForId
    ? (data?.paameldinger.find((p) => p.id === statusDialogForId) ?? null)
    : null;

  const paameldingForSeedDialog = seedDialogForId
    ? (data?.paameldinger.find((p) => p.id === seedDialogForId) ?? null)
    : null;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <div className="space-y-4">
        <PageSection
          title="Påmeldinger"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setMeldPaaDialogOpen(true)}>
                Legg til deltaker
              </Button>
              {turneringStatus === "PaameldingLukket" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDrawDialogOpen(true)}
                  disabled={genererDrawMutation.isPending}
                >
                  Generer draw
                </Button>
              )}
            </div>
          }
        >
          {data && (
            <div className="flex gap-3 text-sm text-muted-foreground mb-2">
              <span>{data.antallGodkjente} godkjent</span>
              {data.antallSokt > 0 && <span>{data.antallSokt} søkt</span>}
              {data.antallReserve > 0 && <span>{data.antallReserve} reserve</span>}
            </div>
          )}
          {aktivePaameldinger.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Ingen påmeldinger ennå.</p>
          ) : (
            <RowPanel>
              <RowList>
                {aktivePaameldinger.map((p) => (
                  <Row
                    key={p.id}
                    title={p.spiller1Navn}
                    description={p.spiller2Navn ?? undefined}
                    right={
                      <div className="flex items-center gap-2">
                        {p.seed != null && (
                          <Badge variant="outline" className="text-xs">
                            #{p.seed}
                          </Badge>
                        )}
                        <PaameldingStatusBadge status={p.status} />
                        {p.kanTrekkeSeg && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => trekkMutation.mutate({ paameldingId: p.id })}
                            disabled={trekkMutation.isPending}
                            className="text-xs"
                          >
                            Trekk
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStatusDialogForId(p.id)}
                          className="text-xs"
                        >
                          Endre
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSeedDialogForId(p.id)}
                          className="text-xs"
                        >
                          Seed
                        </Button>
                        {p.adminMerknad && (
                          <Badge variant="outline" className="text-xs">
                            Merknad
                          </Badge>
                        )}
                      </div>
                    }
                  />
                ))}
              </RowList>
            </RowPanel>
          )}
        </PageSection>

        <MeldPaaDialog
          open={meldPaaDialogOpen}
          onOpenChange={setMeldPaaDialogOpen}
          klasseType={klasse.klasseType}
          erAdmin={true}
          onMeldPaa={(payload) => {
            meldPaaMutation.mutate(payload, {
              onSuccess: () => setMeldPaaDialogOpen(false),
            });
          }}
          isPending={meldPaaMutation.isPending}
        />

        <GenererDrawDialog
          open={drawDialogOpen}
          onOpenChange={setDrawDialogOpen}
          klasseStruktur={klasse.struktur}
          antallGodkjente={data?.antallGodkjente ?? 0}
          erRegenerer={false}
          onGenerer={(payload) => {
            genererDrawMutation.mutate(payload, {
              onSuccess: () => setDrawDialogOpen(false),
            });
          }}
          isPending={genererDrawMutation.isPending}
        />

        {paameldingForStatusDialog && (
          <PaameldingStatusDialog
            open={!!statusDialogForId}
            onOpenChange={(v) => {
              if (!v) setStatusDialogForId(null);
            }}
            spillerNavn={paameldingForStatusDialog.spiller1Navn}
            gjeldendStatus={paameldingForStatusDialog.status}
            onOppdater={(payload) => {
              if (statusDialogForId) {
                statusMutation.mutate({ paameldingId: statusDialogForId, ...payload });
                setStatusDialogForId(null);
              }
            }}
            isPending={statusMutation.isPending}
          />
        )}

        {paameldingForSeedDialog && (
          <SeedDialog
            open={!!seedDialogForId}
            onOpenChange={(v) => {
              if (!v) setSeedDialogForId(null);
            }}
            spillerNavn={paameldingForSeedDialog.spiller1Navn}
            gjeldendeSeed={paameldingForSeedDialog.seed}
            onOppdater={(seed) => {
              if (seedDialogForId) {
                seedMutation.mutate({ paameldingId: seedDialogForId, seed });
                setSeedDialogForId(null);
              }
            }}
            isPending={seedMutation.isPending}
          />
        )}
      </div>
    </QueryFeil>
  );
}

type Props = {
  turnering: TurneringRespons;
};

export default function AdminPaameldingView({ turnering }: Props) {
  const statusMutation = useOppdaterTurneringStatus(turnering.id);
  const neste = nesteStatus(turnering.status);

  const klasseTabs = turnering.klasser.map((klasse) => ({
    value: klasse.id,
    label: klasseTypeNavn(klasse.klasseType),
    content: (
      <AdminPaameldingKlasseTab
        key={klasse.id}
        turneringId={turnering.id}
        klasse={klasse}
        turneringStatus={turnering.status}
      />
    ),
  }));

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
