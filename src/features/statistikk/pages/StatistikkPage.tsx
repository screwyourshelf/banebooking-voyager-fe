import { ShieldX } from "lucide-react";
import { RecordListState } from "@/components/records";
import StatistikkView from "@/features/statistikk/views/StatistikkView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { Page } from "@/components";

export default function StatistikkPage() {
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const kanLeseStatistikk = harHandling(bruker?.kapabiliteter, Kapabiliteter.statistikk.lese);

  return (
    <Page
      eyebrow="Administrasjon"
      title="Statistikk"
      description="Se hvordan klubbens baner brukes og sammenlign bookingaktivitet over tid."
    >
      {laster ? (
        <Page.Loading label="Kontrollerer tilgang" />
      ) : feil ? (
        <Page.AccessError error={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : !kanLeseStatistikk ? (
        <Page.State>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til statistikk"
            description="Statistikk er tilgjengelig for utvidede brukere og klubbadministratorer."
            tone="danger"
          />
        </Page.State>
      ) : (
        <StatistikkView />
      )}
    </Page>
  );
}
