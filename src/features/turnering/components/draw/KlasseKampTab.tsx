import { useState } from "react";
import type { ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import PageSection from "@/components/sections/PageSection";
import Tabs from "@/components/navigation/Tabs";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import { GruppeTab } from "./GruppeTab";
import { SluttspillBracket } from "./SluttspillBracket";
import { ResultatDialog } from "./ResultatDialog";
import { GenererKampplanDialog } from "./GenererKampplanDialog";
import { useDraw } from "../../hooks/draw/useDraw";
import { useGenererKampplan } from "../../hooks/draw/useGenererKampplan";
import { useRegistrerResultat } from "../../hooks/draw/useRegistrerResultat";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { velgKampformat } from "../../utils/kampformatUtils";
import type { TurneringKlasseRespons, RegistrerResultatForespørsel } from "@/types";

export type KlasseKampTabContext = {
  openKampplan: () => void;
  harDraw: boolean;
  kanGenererKampplan: boolean;
  kampplanPending: boolean;
  drawKapabiliteter: string[];
  alleGruppekamperFerdig: boolean;
};

type Props = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
  forslagStartTid?: string | null;
  renderActions?: (ctx: KlasseKampTabContext) => ReactNode;
};

export function KlasseKampTab({ turneringId, klasse, forslagStartTid, renderActions }: Props) {
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
  const alleGruppekamperFerdig =
    drawData?.grupper?.every((g) =>
      g.kamper.every((k) => k.status === "Ferdig" || k.status === "WalkOver" || k.status === "Bye")
    ) ?? false;

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

  const ctx: KlasseKampTabContext = {
    openKampplan: () => setKampplanDialogOpen(true),
    harDraw,
    kanGenererKampplan,
    kampplanPending: genererKampplanMutation.isPending,
    drawKapabiliteter,
    alleGruppekamperFerdig,
  };

  const gruppeTabs =
    drawData?.grupper?.map((gruppe) => ({
      value: gruppe.id,
      label: gruppe.navn,
      content: (
        <GruppeTab
          turneringId={turneringId}
          klasseId={klasse.id}
          gruppe={gruppe}
          kanRegistrere={kanRegistrere}
          onRegistrer={åpneResultatForGruppe}
          visForklaring
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
        <PageSection title="Kampprogram" actions={renderActions?.(ctx)}>
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
          forslagStartTid={forslagStartTid}
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
            antallSett={velgKampformat(klasse, erGruppeKamp).antallSett}
            superTiebreak={velgKampformat(klasse, erGruppeKamp).superTiebreak}
            onSubmit={(payload) => håndterResultatSubmit({ ...payload, kampId: resultatKampId! })}
            isPending={registrerGruppekamp.isPending || registrerSluttspillkamp.isPending}
            serverFeil={
              registrerGruppekamp.error?.message ?? registrerSluttspillkamp.error?.message ?? null
            }
          />
        )}
      </div>
    </QueryFeil>
  );
}
