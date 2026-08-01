import { CircleAlert, ShieldX } from "lucide-react";
import { AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import KunngjøringerAdminView from "@/features/kunngjøringer/views/KunngjøringerAdminView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function KunngjøringerAdminPage() {
  const { bruker, laster, feil, refetch } = useBruker();
  const canAdministerAnnouncements = harHandling(
    bruker?.kapabiliteter,
    Kapabiliteter.kunngjøring.admin
  );

  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Kunngjøringer"
      description="Publiser viktig informasjon som innloggede brukere må lese og bekrefte."
    >
      {laster ? (
        <AdminPageLoading label="Kontrollerer tilgang" />
      ) : feil ? (
        <AdminPageState>
          <RecordListState
            icon={<CircleAlert aria-hidden="true" />}
            title="Kunne ikke kontrollere tilgangen"
            description={feil}
            action={
              <Button type="button" variant="outline" onClick={() => void refetch()}>
                Prøv igjen
              </Button>
            }
            tone="danger"
            role="alert"
          />
        </AdminPageState>
      ) : !canAdministerAnnouncements ? (
        <AdminPageState>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til Kunngjøringer"
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
