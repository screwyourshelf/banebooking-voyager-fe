import { useState } from "react";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import PageSection from "@/components/sections/PageSection";
import { Button } from "@/components/ui/button";
import Tabs from "@/components/navigation/Tabs";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import {
  TurneringStatusBadge,
  klasseTypeNavn,
  GruppeStillingTabell,
  KampKort,
  SluttspillBracket,
  ResultatDialog,
  GenererKampplanDialog,
} from "../../components";
import { useDraw } from "../../hooks/draw/useDraw";
import { useGenererKampplan } from "../../hooks/draw/useGenererKampplan";
import { useRegistrerResultat } from "../../hooks/draw/useRegistrerResultat";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import type {
  TurneringRespons,
  TurneringKlasseRespons,
  TurneringGruppeVisning,
  RegistrerResultatForespørsel,
} from "@/types";

type KlasseTabProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
};

type ResultatansvarligGruppeDrawTabProps = {
  gruppe: TurneringGruppeVisning;
  kanRegistrere: boolean;
  onRegistrer: (kampId: string) => void;
};

function ResultatansvarligGruppeDrawTab({
  gruppe,
  kanRegistrere,
  onRegistrer,
}: ResultatansvarligGruppeDrawTabProps) {
  const items = [
    {
      value: "stilling",
      label: "Stilling",
      content: <GruppeStillingTabell deltakere={gruppe.deltakere} />,
    },
    {
      value: "kamper",
      label: "Kamper",
      content: (
        <div className="space-y-2">
          {gruppe.kamper.map((kamp) => (
            <KampKort
              key={kamp.id}
              kamp={kamp}
              kanRegistrere={kanRegistrere}
              onRegistrer={onRegistrer}
            />
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

function ResultatansvarligKlasseTab({ turneringId, klasse }: KlasseTabProps) {
  const {
    data: drawData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useDraw(turneringId, klasse.id, true);
  const genererKampplanMutation = useGenererKampplan(turneringId, klasse.id);
  const { registrerGruppekamp, registrerSluttspillkamp } = useRegistrerResultat(
    turneringId,
    klasse.id
  );

  const [resultatKampId, setResultatKampId] = useState<string | null>(null);
  const [resultatErSluttspill, setResultatErSluttspill] = useState(false);
  const [kampplanDialogOpen, setKampplanDialogOpen] = useState(false);

  const drawKapabiliteter = drawData?.klasse.kapabiliteter ?? [];
  const kanRegistrere = harHandling(drawKapabiliteter, Kapabiliteter.turnering.registrerResultat);
  const kanGenererKampplan = harHandling(
    drawKapabiliteter,
    Kapabiliteter.turnering.genererKampplan
  );
  const harDraw = !!drawData;

  function åpneResultatForGruppe(kampId: string) {
    setResultatErSluttspill(false);
    setResultatKampId(kampId);
  }

  function åpneResultatForSluttspill(kampId: string) {
    setResultatErSluttspill(true);
    setResultatKampId(kampId);
  }

  function håndterResultatSubmit(payload: RegistrerResultatForespørsel & { kampId: string }) {
    if (!resultatKampId) return;
    const mutasjon = resultatErSluttspill ? registrerSluttspillkamp : registrerGruppekamp;
    mutasjon.mutate(
      { ...payload, kampId: resultatKampId },
      { onSuccess: () => setResultatKampId(null) }
    );
  }

  const alleKamper = [
    ...(drawData?.grupper?.flatMap((g) => g.kamper) ?? []),
    ...(drawData?.sluttspill ?? []),
  ];
  const resultatKamp = resultatKampId
    ? (alleKamper.find((k) => k.id === resultatKampId) ?? null)
    : null;
  const erGruppeKamp = !!drawData?.grupper
    ?.flatMap((g) => g.kamper)
    .find((k) => k.id === resultatKampId);

  if (isLoading) return <ListSkeleton />;

  const gruppeTabs =
    drawData?.grupper?.map((gruppe) => ({
      value: gruppe.id,
      label: gruppe.navn,
      content: (
        <ResultatansvarligGruppeDrawTab
          gruppe={gruppe}
          kanRegistrere={kanRegistrere}
          onRegistrer={åpneResultatForGruppe}
        />
      ),
    })) ?? [];

  const sluttspillTabs =
    drawData?.sluttspill && drawData.sluttspill.length > 0
      ? [
          {
            value: "sluttspill",
            label: "Sluttspill",
            content: (
              <SluttspillBracket
                kamper={drawData.sluttspill}
                kanRegistrere={kanRegistrere}
                onRegistrer={åpneResultatForSluttspill}
              />
            ),
          },
        ]
      : [];

  const gruppePlanTabs = [...gruppeTabs, ...sluttspillTabs];

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <div className="space-y-4">
        <PageSection
          title="Kampprogram"
          actions={
            kanGenererKampplan && harDraw ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setKampplanDialogOpen(true)}
                disabled={genererKampplanMutation.isPending}
              >
                {genererKampplanMutation.isPending ? "Genererer..." : "Generer kampplan"}
              </Button>
            ) : undefined
          }
        >
          {klasse.foreslåttStartTid && (
            <p className="text-sm text-muted-foreground">
              Starter{" "}
              {format(parseISO(klasse.foreslåttStartTid), "EEEE d. MMM 'kl.' HH:mm", {
                locale: nb,
              })}
            </p>
          )}

          {!harDraw && (
            <p className="text-sm text-muted-foreground italic">Draw er ikke generert ennå.</p>
          )}

          {harDraw && gruppePlanTabs.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Ingen grupper ennå.</p>
          )}
          {harDraw && gruppePlanTabs.length > 0 && <Tabs items={gruppePlanTabs} />}
        </PageSection>

        <GenererKampplanDialog
          open={kampplanDialogOpen}
          onOpenChange={setKampplanDialogOpen}
          onGenerer={(payload) => {
            genererKampplanMutation.mutate(payload);
            setKampplanDialogOpen(false);
          }}
          isPending={genererKampplanMutation.isPending}
        />

        {resultatKamp && (
          <ResultatDialog
            open={!!resultatKampId}
            onOpenChange={(v) => {
              if (!v) setResultatKampId(null);
            }}
            kamp={resultatKamp}
            antallSett={
              erGruppeKamp && klasse.gruppespillKampFormat
                ? klasse.gruppespillKampFormat.antallSett
                : klasse.sluttspillKampFormat.antallSett
            }
            onSubmit={(payload) => håndterResultatSubmit({ ...payload, kampId: resultatKampId! })}
            isPending={registrerGruppekamp.isPending || registrerSluttspillkamp.isPending}
          />
        )}
      </div>
    </QueryFeil>
  );
}

type Props = {
  turnering: TurneringRespons;
};

export default function ResultatansvarligKampView({ turnering }: Props) {
  const klasseTabs = turnering.klasser.map((klasse) => ({
    value: klasse.id,
    label: klasseTypeNavn(klasse.klasseType),
    content: (
      <ResultatansvarligKlasseTab key={klasse.id} turneringId={turnering.id} klasse={klasse} />
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
