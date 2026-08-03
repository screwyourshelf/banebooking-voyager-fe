import { ShieldX } from "lucide-react";
import { AdminAccessError, AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import StatistikkView from "@/features/statistikk/views/StatistikkView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function StatistikkPage() {
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const kanLeseStatistikk = harHandling(bruker?.kapabiliteter, Kapabiliteter.statistikk.lese);

  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Statistikk"
      description="Se hvordan klubbens baner brukes og sammenlign bookingaktivitet over tid."
    >
      {laster ? (
        <AdminPageLoading label="Kontrollerer tilgang" />
      ) : feil ? (
        <AdminAccessError feil={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : !kanLeseStatistikk ? (
        <AdminPageState>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til statistikk"
            description="Statistikk er tilgjengelig for klubbadministratorer."
            tone="danger"
          />
        </AdminPageState>
      ) : (
        <StatistikkView />
      )}
    </AdminPage>
  );
}
