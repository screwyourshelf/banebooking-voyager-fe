import { useState } from "react";
import type {
  TurneringRespons,
  TurneringKlasseRespons,
  PaameldingStatus,
  TurneringGruppeVisning,
} from "@/types";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import Tabs from "@/components/navigation/Tabs";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil, ServerFeil } from "@/components/errors";
import {
  TurneringStatusBadge,
  klasseTypeNavn,
  MeldPaaDialog,
  PaameldingStatusBadge,
  GruppeStillingTabellMedForklaring,
  KampKort,
  SluttspillBracket,
} from "../../components";
import { usePaameldinger } from "../../hooks/paamelding/usePaameldinger";
import { useMeldPaaKlasse } from "../../hooks/paamelding/useMeldPaaKlasse";
import { useTrekkPaamelding } from "../../hooks/paamelding/useTrekkPaamelding";
import { useDraw } from "../../hooks/draw/useDraw";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import TurneringSpillerContent from "./TurneringSpillerContent";

const UGYLDIGE_STATUSER: PaameldingStatus[] = ["Avslatt", "TrukketSeg"];

type PaameldingKlasseTabProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
  kanMeldePaa: boolean;
};

function SpillerPaameldingKlasseTab({
  turneringId,
  klasse,
  kanMeldePaa,
}: PaameldingKlasseTabProps) {
  const { data, isLoading, error, refetch, isFetching } = usePaameldinger(turneringId, klasse.id);
  const meldPaaMutation = useMeldPaaKlasse(turneringId, klasse.id);
  const trekkMutation = useTrekkPaamelding(turneringId, klasse.id);
  const [meldPaaOpen, setMeldPaaOpen] = useState(false);

  if (isLoading) return <ListSkeleton />;

  const aktivePaameldinger =
    data?.paameldinger.filter((p) => !UGYLDIGE_STATUSER.includes(p.status)) ?? [];

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <div className="space-y-4">
        <PageSection
          title="Påmeldinger"
          actions={
            kanMeldePaa ? (
              <Button size="sm" variant="outline" onClick={() => setMeldPaaOpen(true)}>
                Meld på
              </Button>
            ) : undefined
          }
        >
          {data && (
            <div className="flex gap-3 text-sm text-muted-foreground mb-2">
              <span>{data.antallGodkjente} godkjent</span>
              {data.antallSokt > 0 && <span>{data.antallSokt} søkt</span>}
              {data.antallReserve > 0 && <span>{data.antallReserve} reserve</span>}
            </div>
          )}
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
                        <PaameldingStatusBadge status={p.status} />
                        {p.kanTrekkeSeg && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => trekkMutation.mutate({ paameldingId: p.id })}
                            disabled={trekkMutation.isPending}
                            className="text-xs"
                          >
                            Trekk meg
                          </Button>
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
          open={meldPaaOpen}
          onOpenChange={setMeldPaaOpen}
          klasseType={klasse.klasseType}
          erAdmin={false}
          onMeldPaa={(payload) => {
            meldPaaMutation.mutate(payload, {
              onSuccess: () => setMeldPaaOpen(false),
            });
          }}
          isPending={meldPaaMutation.isPending}
          serverFeil={meldPaaMutation.error?.message ?? null}
        />
      </div>
    </QueryFeil>
  );
}

type DrawKlasseTabProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
};

type GruppeDrawTabProps = {
  turneringId: string;
  klasseId: string;
  gruppe: TurneringGruppeVisning;
};

function GruppeDrawTab({ turneringId, klasseId, gruppe }: GruppeDrawTabProps) {
  const items = [
    {
      value: "stilling",
      label: "Stilling",
      content: (
        <GruppeStillingTabellMedForklaring
          deltakere={gruppe.deltakere}
          turneringId={turneringId}
          klasseId={klasseId}
          gruppeId={gruppe.id}
        />
      ),
    },
    {
      value: "kamper",
      label: "Kamper",
      content: (
        <div className="space-y-2">
          {gruppe.kamper.map((kamp) => (
            <KampKort key={kamp.id} kamp={kamp} kanRegistrere={false} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {gruppe.foreslåttBane && (
        <p className="text-sm text-muted-foreground">Bane: {gruppe.foreslåttBane}</p>
      )}
      <Tabs items={items} />
    </div>
  );
}

function SpillerDrawKlasseTab({ turneringId, klasse }: DrawKlasseTabProps) {
  const {
    data: drawData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useDraw(turneringId, klasse.id, true);

  if (isLoading) return <ListSkeleton />;

  const gruppeTabs =
    drawData?.grupper?.map((gruppe) => ({
      value: gruppe.id,
      label: gruppe.navn,
      content: <GruppeDrawTab turneringId={turneringId} klasseId={klasse.id} gruppe={gruppe} />,
    })) ?? [];

  const sluttspillTabs =
    drawData?.sluttspill && drawData.sluttspill.length > 0
      ? [
          {
            value: "sluttspill",
            label: "Sluttspill",
            content: <SluttspillBracket kamper={drawData.sluttspill} kanRegistrere={false} />,
          },
        ]
      : [];

  const allTabs = [...gruppeTabs, ...sluttspillTabs];

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <PageSection title="Kampprogram">
        {!drawData && (
          <p className="text-sm text-muted-foreground italic">Ingen kampprogram tilgjengelig.</p>
        )}
        {drawData && allTabs.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Ingen grupper ennå.</p>
        )}
        {drawData && allTabs.length > 0 && <Tabs items={allTabs} />}
      </PageSection>
    </QueryFeil>
  );
}

type Props = {
  turnering: TurneringRespons;
};

export default function TurneringSpillerView({ turnering }: Props) {
  const { status } = turnering;
  const kanMeldePaa = harHandling(turnering.kapabiliteter, Kapabiliteter.turnering.meldPaaKlasse);

  const visDrawFaser = status === "DrawPublisert" || status === "Pagaar" || status === "Avsluttet";
  const visPaamelding = status === "PaameldingAapen";

  const klasseTabs = turnering.klasser.map((klasse) => ({
    value: klasse.id,
    label: klasseTypeNavn(klasse.klasseType),
    content: visDrawFaser ? (
      <SpillerDrawKlasseTab key={klasse.id} turneringId={turnering.id} klasse={klasse} />
    ) : (
      <SpillerPaameldingKlasseTab
        key={klasse.id}
        turneringId={turnering.id}
        klasse={klasse}
        kanMeldePaa={kanMeldePaa && status === "PaameldingAapen"}
      />
    ),
  }));

  return (
    <TurneringSpillerContent
      turnering={turnering}
      klasseTabs={klasseTabs}
      visPaamelding={visPaamelding}
      visDrawFaser={visDrawFaser}
    />
  );
}
