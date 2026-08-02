import { ShieldX } from "lucide-react";
import { AdminAccessError, AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import KunngjøringerAdminView from "@/features/kunngjøringer/views/KunngjøringerAdminView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function KunngjøringerAdminPage() {
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const canAdministerAnnouncements = harHandling(
    bruker?.kapabiliteter,
    Kapabiliteter.kunngjøring.admin
  );

  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Kunngjøringer"
      description="Styr informasjon som må leses og bekreftes før brukerne går videre."
    >
      {laster ? (
        <AdminPageLoading label="Kontrollerer tilgang" />
      ) : feil ? (
        <AdminAccessError feil={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : !canAdministerAnnouncements ? (
        <AdminPageState>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til kunngjøringer"
            description="En klubbadministrator må gi deg tilgang før du kan administrere kunngjøringer."
            tone="danger"
          />
        </AdminPageState>
      ) : (
        <KunngjøringerAdminView />
      )}
    </AdminPage>
  );
}
