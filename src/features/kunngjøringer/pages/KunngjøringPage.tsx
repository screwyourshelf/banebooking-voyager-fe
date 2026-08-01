import { CircleAlert } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AdminFormActions, AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { ContentDocument, ContentDocumentIntro } from "@/components/layout";
import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useBekreftKunngjøring } from "@/features/kunngjøringer/hooks/useBekreftKunngjøring";
import { useBruker } from "@/hooks/useBruker";

export default function KunngjøringPage() {
  const { bruker, laster, feil: brukerFeil, refetch } = useBruker();
  const kunngjøring = bruker?.ulestKunngjøring;
  const { bekreft, laster: bekrefter, feil } = useBekreftKunngjøring(kunngjøring?.id ?? "");

  if (laster) {
    return (
      <AdminPage
        eyebrow="Viktig beskjed"
        title="Kunngjøring"
        description="Laster informasjon fra klubben."
      >
        <AdminPageLoading label="Laster kunngjøring" />
      </AdminPage>
    );
  }

  if (brukerFeil) {
    return (
      <AdminPage
        eyebrow="Viktig beskjed"
        title="Kunngjøring"
        description="Informasjonen må lastes før du kan fortsette."
      >
        <AdminPageState>
          <RecordListState
            icon={<CircleAlert aria-hidden="true" />}
            title="Kunne ikke laste kunngjøringen"
            description={brukerFeil}
            action={
              <Button type="button" variant="outline" onClick={() => void refetch()}>
                Prøv igjen
              </Button>
            }
            tone="danger"
            role="alert"
          />
        </AdminPageState>
      </AdminPage>
    );
  }

  if (!kunngjøring) {
    return <Navigate to=".." replace />;
  }

  const handleBekreft = async () => {
    try {
      await bekreft();
    } catch {
      // Feilen vises i handlingens felles feilflate.
    }
  };

  return (
    <AdminPage
      eyebrow="Viktig beskjed"
      title={kunngjøring.tittel}
      description="Les informasjonen fra klubben før du fortsetter."
      action={<RecordStatus tone="warning">Må bekreftes</RecordStatus>}
    >
      <ContentDocument>
        <ContentDocumentIntro>{kunngjøring.tekst}</ContentDocumentIntro>
        <AdminFormActions>
          <ServerFeil feil={feil?.message ?? null} />
          <Button type="button" onClick={() => void handleBekreft()} disabled={bekrefter}>
            {bekrefter ? "Bekrefter…" : "Jeg har lest kunngjøringen"}
          </Button>
        </AdminFormActions>
      </ContentDocument>
    </AdminPage>
  );
}
