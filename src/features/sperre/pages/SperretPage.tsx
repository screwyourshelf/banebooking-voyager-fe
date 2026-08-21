import { CircleAlert } from "lucide-react";

import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useKlubb } from "@/hooks/useKlubb";
import { Form, Settings, Page, Document } from "@/components";

export default function SperretPage() {
  const { data: klubb, isLoading, error, refetch } = useKlubb();

  if (isLoading) {
    return (
      <Page
        eyebrow="Tilgang"
        title="Kontoen er sperret"
        description="Du kan ikke bruke Banebooking før klubben opphever sperren."
      >
        <Page.Loading label="Laster sperreinformasjon" />
      </Page>
    );
  }

  if (error || !klubb) {
    return (
      <Page
        eyebrow="Tilgang"
        title="Kontoen er sperret"
        description="Du kan ikke bruke Banebooking før klubben opphever sperren."
      >
        <Page.State>
          <RecordListState
            icon={<CircleAlert aria-hidden="true" />}
            title="Kunne ikke laste sperreinformasjonen"
            description={error?.message ?? "Prøv igjen om litt."}
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

  return (
    <Page
      eyebrow="Tilgang"
      title="Kontoen er sperret"
      description="Du kan ikke bruke Banebooking før klubben opphever sperren."
      actions={<RecordStatus tone="danger">Sperret</RecordStatus>}
    >
      <Document>
        <Document.Intro>
          Du kan ikke booke baner eller melde deg på arrangementer mens sperren er aktiv.
        </Document.Intro>

        <Settings.Section
          eyebrow="Konto"
          title="Kontakt klubben"
          description="Klubben må avklare eller oppheve sperren."
          embedded
          tone="danger"
        >
          <Settings.Panel>
            <Settings.Row title="Neste steg">
              <Settings.Text>Ta kontakt med {klubb.navn} for mer informasjon.</Settings.Text>
            </Settings.Row>
          </Settings.Panel>

          {klubb.kontaktEpost ? (
            <Form.Actions>
              <Button asChild variant="outline">
                <a href={`mailto:${klubb.kontaktEpost}`}>Kontakt klubben</a>
              </Button>
            </Form.Actions>
          ) : null}
        </Settings.Section>
      </Document>
    </Page>
  );
}
