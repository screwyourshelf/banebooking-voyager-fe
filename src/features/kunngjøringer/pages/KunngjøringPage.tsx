import { Navigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { Form, Page, Document } from "@/components";

import { ServerFeil } from "@/components/errors";

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
      <Page
        eyebrow="Fra klubben"
        title="Kunngjøring"
        description="Les og bekreft før du går videre."
      >
        <Page.Loading label="Laster kunngjøring" />
      </Page>
    );
  }

  if (brukerFeil) {
    return (
      <Page
        eyebrow="Fra klubben"
        title="Kunngjøring"
        description="Les og bekreft før du går videre."
      >
        <Page.State>
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
        </Page.State>
      </Page>
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
    <Page
      eyebrow="Fra klubben"
      title={kunngjøring.tittel}
      description="Les og bekreft før du går videre."
      actions={<RecordStatus tone="warning">Må bekreftes</RecordStatus>}
    >
      <Document>
        <Document.Intro>{kunngjøring.tekst}</Document.Intro>
        <Form.Actions>
          <ServerFeil feil={feil?.message ?? null} />
          <Button type="button" onClick={() => void handleBekreft()} disabled={bekrefter}>
            {bekrefter ? "Bekrefter…" : "Jeg har lest kunngjøringen"}
          </Button>
        </Form.Actions>
      </Document>
    </Page>
  );
}
