import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import PageSection from "@/components/sections/PageSection";
import Tabs from "@/components/navigation/Tabs";
import { ListSkeleton } from "@/components/loading";
import { QueryFeil } from "@/components/errors";
import { klasseTypeNavn, GruppeTab, SluttspillBracket } from "../../components";
import { useDraw } from "../../hooks/draw/useDraw";
import AdminAvsluttetContent from "./AdminAvsluttetContent";
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

  const gruppeTabs =
    drawData?.grupper?.map((gruppe) => ({
      value: gruppe.id,
      label: gruppe.navn,
      content: <GruppeTab gruppe={gruppe} turneringId={turneringId} klasseId={klasse.id} />,
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

  const gruppePlanTabs = [...gruppeTabs, ...sluttspillTabs];

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

        {harDraw && gruppePlanTabs.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Ingen grupper tilgjengelig.</p>
        )}

        {harDraw && gruppePlanTabs.length > 0 && <Tabs items={gruppePlanTabs} />}
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

  return <AdminAvsluttetContent turnering={turnering} klasseTabs={klasseTabs} />;
}
