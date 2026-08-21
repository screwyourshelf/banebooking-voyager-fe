import { ShieldX } from "lucide-react";
import Tabs from "@/components/navigation/Tabs";
import { RecordListState } from "@/components/records";
import KlubbInnstillingerView from "@/features/klubb/views/klubb-innstillinger/KlubbInnstillingerView";
import MedlemskapInnstillingerView from "@/features/klubb/views/medlemskap-innstillinger/MedlemskapInnstillingerView";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { Page } from "@/components";

export default function KlubbPage() {
  const { bruker, laster, feil, isFetching, refetch } = useBruker();
  const canAdministerClub = harHandling(bruker?.kapabiliteter, Kapabiliteter.klubb.admin);

  return (
    <Page
      eyebrow="Administrasjon"
      title="Klubbinnstillinger"
      description="Oppdater klubbprofilen og styr tjenester og medlemsbekreftelse."
    >
      {laster ? (
        <Page.Loading label="Kontrollerer tilgang" />
      ) : feil ? (
        <Page.AccessError error={feil} isFetching={isFetching} onRetry={() => void refetch()} />
      ) : !canAdministerClub ? (
        <Page.State>
          <RecordListState
            icon={<ShieldX aria-hidden="true" />}
            title="Du har ikke tilgang til klubbinnstillinger"
            description="En klubbadministrator må gi deg tilgang før du kan endre klubbens innstillinger."
            tone="danger"
          />
        </Page.State>
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
    </Page>
  );
}
