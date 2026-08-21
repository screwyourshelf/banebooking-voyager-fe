import { ShieldX } from "lucide-react";
import { RecordListState } from "@/components/records";
import KunngjøringerAdminView from "@/features/kunngjøringer/views/KunngjøringerAdminView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { Page } from "@/components";

export default function KunngjøringerAdminPage() {
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const canAdministerAnnouncements = harHandling(
    bruker?.kapabiliteter,
    Kapabiliteter.kunngjøring.admin
  );

  if (!laster && !feil && canAdministerAnnouncements) {
    return <KunngjøringerAdminView />;
  }

  return (
    <Page
      eyebrow="Administrasjon"
      title="Kunngjøringer"
      description="Styr informasjon som må leses og bekreftes før brukerne går videre."
    >
      {laster ? (
        <Page.Loading label="Kontrollerer tilgang" />
      ) : feil ? (
        <Page.AccessError error={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : (
        <Page.State>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til kunngjøringer"
            description="En klubbadministrator må gi deg tilgang før du kan administrere kunngjøringer."
            tone="danger"
          />
        </Page.State>
      )}
    </Page>
  );
}
