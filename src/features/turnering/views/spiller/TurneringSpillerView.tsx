import { useState } from "react";
import type { TurneringRespons, TurneringKlasseRespons } from "@/types";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { Button } from "@/components/ui/button";
import Tabs from "@/components/navigation/Tabs";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil, ServerFeil } from "@/components/errors";
import { klasseTypeNavn, MeldPaaDialog, GruppeTab, SluttspillBracket } from "../../components";
import { usePaameldinger } from "../../hooks/paamelding/usePaameldinger";
import { useMeldPaaKlasse } from "../../hooks/paamelding/useMeldPaaKlasse";
import { useTrekkPaamelding } from "../../hooks/paamelding/useTrekkPaamelding";
import { useDraw } from "../../hooks/draw/useDraw";
import TurneringSpillerContent from "./TurneringSpillerContent";

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

  const aktivePaameldinger = data?.paameldinger.filter((p) => !p.trukketSeg) ?? [];

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <div className="app-stack app-stack--lg">
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
            <div className="app-summary-meta">
              <span>{data.antallPaameldte} påmeldt</span>
            </div>
          )}
          <ServerFeil feil={trekkMutation.error?.message ?? null} />
          {aktivePaameldinger.length === 0 ? (
            <p className="app-text-empty">Ingen påmeldinger ennå.</p>
          ) : (
            <RowPanel>
              <RowList>
                {aktivePaameldinger.map((p) => (
                  <Row
                    key={p.id}
                    title={p.spiller1Navn}
                    description={p.spiller2Navn ?? undefined}
                    right={
                      <div className="app-inline">
                        {p.kanTrekkeSeg && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => trekkMutation.mutate({ paameldingId: p.id })}
                            disabled={trekkMutation.isPending}
                            className="app-text-caption"
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
      content: (
        <GruppeTab turneringId={turneringId} klasseId={klasse.id} gruppe={gruppe} visForklaring />
      ),
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
        {!drawData && <p className="app-text-empty">Ingen kampprogram tilgjengelig.</p>}
        {drawData && allTabs.length === 0 && <p className="app-text-empty">Ingen grupper ennå.</p>}
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

  const visDrawFaser = status === "Pagaar" || status === "Avsluttet";
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
        kanMeldePaa={visPaamelding}
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
