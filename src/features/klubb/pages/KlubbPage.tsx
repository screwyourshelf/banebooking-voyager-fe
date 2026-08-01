import { ShieldX } from "lucide-react";
import { AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import Tabs from "@/components/navigation/Tabs";
import { RecordListState } from "@/components/records";
import KlubbInnstillingerView from "@/features/klubb/views/klubb-innstillinger/KlubbInnstillingerView";
import MedlemskapInnstillingerView from "@/features/klubb/views/medlemskap-innstillinger/MedlemskapInnstillingerView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";

export default function KlubbPage() {
  const { bruker, laster } = useBruker();
  const canAdministerClub = harHandling(bruker?.kapabiliteter, Kapabiliteter.klubb.admin);

  return (
    <AdminPage
      eyebrow="Administrasjon"
      title="Klubbinnstillinger"
      description="Administrer klubbprofil, tjenester og medlemskapsbekreftelse."
    >
      {laster ? (
        <AdminPageLoading label="Kontrollerer tilgang" />
      ) : !canAdministerClub ? (
        <AdminPageState>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til Klubbinnstillinger"
            description="En klubbadministrator må gi deg tilgang før du kan endre klubbens innstillinger."
            tone="danger"
          />
        </AdminPageState>
      ) : (
        <Tabs
          variant="section"
          ariaLabel="Innstillingsområder"
          items={[
            {
              value: "klubbprofil",
              label: "Klubbprofil",
              content: <KlubbInnstillingerView />,
            },
            {
              value: "medlemskap",
              label: "Medlemskap",
              content: <MedlemskapInnstillingerView />,
            },
          ]}
        />
      )}
    </AdminPage>
  );
}
