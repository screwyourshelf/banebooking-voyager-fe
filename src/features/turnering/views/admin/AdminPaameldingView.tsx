import { useState } from "react";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Tabs from "@/components/navigation/Tabs";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil, ServerFeil } from "@/components/errors";
import {
  klasseTypeNavn,
  MeldPaaDialog,
  PaameldingStatusDialog,
  GenererDrawDialog,
  OppdaterKlasseStrukturDialog,
  KlasseKampTab,
  type KlasseKampTabContext,
} from "../../components";
import { useOppdaterTurneringStatus } from "../../hooks/turnering/useOppdaterTurneringStatus";
import { usePaameldinger } from "../../hooks/paamelding/usePaameldinger";
import { useMeldPaaKlasseOgSeed } from "../../hooks/paamelding/useMeldPaaKlasseOgSeed";
import { useTrekkPaamelding } from "../../hooks/paamelding/useTrekkPaamelding";
import { useOppdaterPaameldingSeed } from "../../hooks/paamelding/useOppdaterPaameldingSeed";
import { useGenererDraw } from "../../hooks/draw/useGenererDraw";
import { useFrøSluttspill } from "../../hooks/draw/useFrøSluttspill";
import { useOppdaterKlasseStruktur } from "../../hooks/turnering/useOppdaterKlasseStruktur";
import { useAdminBrukere } from "@/features/brukere/hooks/useAdminBrukere";
import { useOppdaterPaameldingDetaljer } from "../../hooks/paamelding/useOppdaterPaameldingDetaljer";
import { nesteStatus, forrigeStatus } from "./adminStatusUtils";
import AdminPaameldingContent from "./AdminPaameldingContent";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TurneringRespons, TurneringKlasseRespons, BrukerRespons, KlasseType } from "@/types";

const DOBBEL_KLASSER: KlasseType[] = ["HerreDobbel", "DameDobbel", "MixedDobbel", "JuniorDobbel"];

type KlasseTabProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
  brukere: BrukerRespons[];
};

function AdminPaameldingKlasseTab({ turneringId, klasse, brukere }: KlasseTabProps) {
  const { data, isLoading, error, refetch, isFetching } = usePaameldinger(turneringId, klasse.id);
  const trekkMutation = useTrekkPaamelding(turneringId, klasse.id);
  const meldPaaOgSeedMutation = useMeldPaaKlasseOgSeed(turneringId, klasse.id);
  const seedMutation = useOppdaterPaameldingSeed(turneringId, klasse.id);
  const detaljerMutation = useOppdaterPaameldingDetaljer(turneringId, klasse.id);

  const [meldPaaDialogOpen, setMeldPaaDialogOpen] = useState(false);
  const [statusDialogForId, setStatusDialogForId] = useState<string | null>(null);

  if (isLoading) return <ListSkeleton />;

  const aktivePaameldinger = data?.paameldinger.filter((p) => !p.trukketSeg) ?? [];

  const paameldingForStatusDialog = statusDialogForId
    ? (data?.paameldinger.find((p) => p.id === statusDialogForId) ?? null)
    : null;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <div className="space-y-4">
        <PageSection
          title="Påmeldinger"
          actions={
            <Button size="sm" variant="outline" onClick={() => setMeldPaaDialogOpen(true)}>
              Legg til deltaker
            </Button>
          }
        >
          <ServerFeil feil={trekkMutation.error?.message ?? null} />
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => trekkMutation.mutate({ paameldingId: p.id })}
                          disabled={trekkMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStatusDialogForId(p.id)}
                          className="text-xs"
                        >
                          Endre
                        </Button>
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
          brukere={brukere}
          onMeldPaa={(payload, seed) => {
            meldPaaOgSeedMutation.mutate(
              { ...payload, seed },
              { onSuccess: () => setMeldPaaDialogOpen(false) }
            );
          }}
          isPending={meldPaaOgSeedMutation.isPending}
          serverFeil={meldPaaOgSeedMutation.error?.message ?? null}
        />

        {paameldingForStatusDialog && (
          <PaameldingStatusDialog
            open={!!statusDialogForId}
            onOpenChange={(v) => {
              if (!v) setStatusDialogForId(null);
            }}
            spillerNavn={paameldingForStatusDialog.spiller1Navn}
            spiller2Navn={paameldingForStatusDialog.spiller2Navn}
            erDobbel={DOBBEL_KLASSER.includes(klasse.klasseType)}
            gjeldendeSeed={paameldingForStatusDialog.seed}
            brukere={brukere}
            onOppdaterSeed={(seed) => {
              if (!statusDialogForId) return;
              seedMutation.mutate(
                { paameldingId: statusDialogForId, seed },
                { onSuccess: () => setStatusDialogForId(null) }
              );
            }}
            onOppdaterDetaljer={(payload) => {
              if (!statusDialogForId) return;
              detaljerMutation.mutate(
                { paameldingId: statusDialogForId, ...payload },
                { onSuccess: () => setStatusDialogForId(null) }
              );
            }}
            isDetaljerPending={detaljerMutation.isPending}
            detaljerFeil={detaljerMutation.error?.message ?? null}
            isPending={seedMutation.isPending}
            serverFeil={seedMutation.error?.message ?? null}
          />
        )}
      </div>
    </QueryFeil>
  );
}

type AdminPaameldingDrawHandlingerProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
  ctx: KlasseKampTabContext;
};

function AdminPaameldingDrawHandlinger({
  turneringId,
  klasse,
  ctx,
}: AdminPaameldingDrawHandlingerProps) {
  const genererDrawMutation = useGenererDraw(turneringId, klasse.id);
  const frøSluttspillMutation = useFrøSluttspill(turneringId, klasse.id);
  const oppdaterStrukturMutation = useOppdaterKlasseStruktur(turneringId);
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [redigerStrukturOpen, setRedigerStrukturOpen] = useState(false);
  const kanFrøSluttspill = harHandling(
    ctx.drawKapabiliteter,
    Kapabiliteter.turnering.frøSluttspill
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Handlinger</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRedigerStrukturOpen(true)}>
            Rediger struktur
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDrawDialogOpen(true)}
            disabled={genererDrawMutation.isPending}
          >
            {ctx.harDraw ? "Regenerer draw" : "Generer draw"}
          </DropdownMenuItem>
          {ctx.kanGenererKampplan && ctx.harDraw && (
            <DropdownMenuItem onClick={() => ctx.openKampplan()} disabled={ctx.kampplanPending}>
              Generer kampplan
            </DropdownMenuItem>
          )}
          {kanFrøSluttspill && ctx.harDraw && (
            <DropdownMenuItem
              onClick={() => frøSluttspillMutation.mutate()}
              disabled={frøSluttspillMutation.isPending || !ctx.alleGruppekamperFerdig}
            >
              Frø sluttspill
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <GenererDrawDialog
        open={drawDialogOpen}
        onOpenChange={setDrawDialogOpen}
        klasseStruktur={klasse.struktur}
        antallPaameldte={klasse.antallPaameldte}
        erRegenerer={ctx.harDraw}
        onGenerer={(payload) => {
          genererDrawMutation.mutate(payload);
          setDrawDialogOpen(false);
        }}
        isPending={genererDrawMutation.isPending}
      />
      <OppdaterKlasseStrukturDialog
        open={redigerStrukturOpen}
        onOpenChange={setRedigerStrukturOpen}
        klasse={klasse}
        onOppdater={(payload) =>
          oppdaterStrukturMutation.mutate(
            { klasseId: klasse.id, ...payload },
            { onSuccess: () => setRedigerStrukturOpen(false) }
          )
        }
        isPending={oppdaterStrukturMutation.isPending}
        serverFeil={oppdaterStrukturMutation.error?.message ?? null}
      />
    </>
  );
}

type PaameldingAapenKlasseTabProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
  turnering: TurneringRespons;
  brukere: BrukerRespons[];
};

function AdminPaameldingAapenKlasseTab({
  turneringId,
  klasse,
  turnering,
  brukere,
}: PaameldingAapenKlasseTabProps) {
  const innerTabs = [
    {
      value: "paamelding",
      label: "Påmeldinger",
      content: (
        <AdminPaameldingKlasseTab turneringId={turneringId} klasse={klasse} brukere={brukere} />
      ),
    },
    {
      value: "draw",
      label: "Draw",
      content: (
        <KlasseKampTab
          turneringId={turneringId}
          klasse={klasse}
          forslagStartTid={
            klasse.foreslåttStartTid ??
            (turnering.arrangementStartDato ? `${turnering.arrangementStartDato}T09:00` : null)
          }
          renderActions={(ctx) => (
            <AdminPaameldingDrawHandlinger turneringId={turneringId} klasse={klasse} ctx={ctx} />
          )}
        />
      ),
    },
  ];

  return <Tabs items={innerTabs} />;
}

type Props = {
  turnering: TurneringRespons;
};

export default function AdminPaameldingView({ turnering }: Props) {
  const statusMutation = useOppdaterTurneringStatus(turnering.id);
  const neste = nesteStatus(turnering.status);
  const forrige = forrigeStatus(turnering.status);
  const { brukere } = useAdminBrukere();

  const klasseTabs = turnering.klasser.map((klasse) => ({
    value: klasse.id,
    label: klasseTypeNavn(klasse.klasseType),
    content: (
      <AdminPaameldingAapenKlasseTab
        key={klasse.id}
        turneringId={turnering.id}
        klasse={klasse}
        turnering={turnering}
        brukere={brukere}
      />
    ),
  }));

  return (
    <AdminPaameldingContent
      turnering={turnering}
      neste={neste}
      onNesteStatus={() => statusMutation.mutate({ nyStatus: neste! })}
      nesteStatusPending={statusMutation.isPending}
      forrige={forrige}
      onForrigeStatus={forrige ? () => statusMutation.mutate({ nyStatus: forrige }) : undefined}
      klasseTabs={klasseTabs}
    />
  );
}
