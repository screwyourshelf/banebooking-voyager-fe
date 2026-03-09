import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import PageSection from "@/components/sections/PageSection";
import Tabs from "@/components/navigation/Tabs";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import {
  TurneringStatusBadge,
  klasseTypeNavn,
  GruppeStillingTabell,
  KampKort,
  SluttspillBracket,
} from "../../components";
import { useDraw } from "../../hooks/draw/useDraw";
import type { TurneringRespons, TurneringKlasseRespons } from "@/types";

type KlasseTabProps = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
};

function AdminAvsluttetKlasseTab({ turneringId, klasse }: KlasseTabProps) {
  const {
    data: drawData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useDraw(turneringId, klasse.id, true);

  if (isLoading) return <ListSkeleton />;

  const harDraw = !!drawData;

  return (
    <QueryFeil error={error} isFetching={isFetching} onRetry={() => void refetch()}>
      <PageSection title="Kampprogram">
        {klasse.foreslåttStartTid && (
          <p className="text-sm text-muted-foreground">
            Startet{" "}
            {format(parseISO(klasse.foreslåttStartTid), "EEEE d. MMM 'kl.' HH:mm", {
              locale: nb,
            })}
          </p>
        )}

        {!harDraw && (
          <p className="text-sm text-muted-foreground italic">Ingen kampprogram tilgjengelig.</p>
        )}

        {harDraw && drawData && (
          <div className="space-y-4">
            {drawData.grupper?.map((gruppe) => (
              <div key={gruppe.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{gruppe.navn}</h4>
                  {gruppe.foreslåttBane && (
                    <span className="text-sm text-muted-foreground">→ {gruppe.foreslåttBane}</span>
                  )}
                </div>
                <GruppeStillingTabell deltakere={gruppe.deltakere} />
                <div className="space-y-2">
                  {gruppe.kamper.map((kamp) => (
                    <KampKort key={kamp.id} kamp={kamp} kanRegistrere={false} />
                  ))}
                </div>
              </div>
            ))}

            {drawData.sluttspill && drawData.sluttspill.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Sluttspill</h4>
                <SluttspillBracket kamper={drawData.sluttspill} kanRegistrere={false} />
              </div>
            )}
          </div>
        )}
      </PageSection>
    </QueryFeil>
  );
}

type Props = {
  turnering: TurneringRespons;
};

export default function AdminAvsluttetView({ turnering }: Props) {
  const klasseTabs = turnering.klasser.map((klasse) => ({
    value: klasse.id,
    label: klasseTypeNavn(klasse.klasseType),
    content: <AdminAvsluttetKlasseTab key={klasse.id} turneringId={turnering.id} klasse={klasse} />,
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
