import { CircleAlert } from "lucide-react";
import {
  AdminFormActions,
  AdminPage,
  AdminPageLoading,
  AdminPageState,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsText,
} from "@/components/admin";
import { ContentDocument, ContentDocumentIntro } from "@/components/layout";
import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useKlubb } from "@/hooks/useKlubb";

export default function SperretPage() {
  const { data: klubb, isLoading, error, refetch } = useKlubb();

  if (isLoading) {
    return (
      <AdminPage
        eyebrow="Tilgang"
        title="Kontoen er sperret"
        description="Du kan ikke bruke Banebooking før klubben opphever sperren."
      >
        <AdminPageLoading label="Laster sperreinformasjon" />
      </AdminPage>
    );
  }

  if (error || !klubb) {
    return (
      <AdminPage
        eyebrow="Tilgang"
        title="Kontoen er sperret"
        description="Du kan ikke bruke Banebooking før klubben opphever sperren."
      >
        <AdminPageState>
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
        </AdminPageState>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      eyebrow="Tilgang"
      title="Kontoen er sperret"
      description="Du kan ikke bruke Banebooking før klubben opphever sperren."
      action={<RecordStatus tone="danger">Sperret</RecordStatus>}
    >
      <ContentDocument>
        <ContentDocumentIntro>
          Du kan ikke booke baner eller melde deg på arrangementer mens sperren er aktiv.
        </ContentDocumentIntro>

        <SettingsSection
          eyebrow="Konto"
          title="Kontakt klubben"
          description="Klubben må avklare eller oppheve sperren."
          embedded
          tone="danger"
        >
          <SettingsPanel>
            <SettingsRow title="Neste steg">
              <SettingsText>Ta kontakt med {klubb.navn} for mer informasjon.</SettingsText>
            </SettingsRow>
          </SettingsPanel>

          {klubb.kontaktEpost ? (
            <AdminFormActions>
              <Button asChild variant="outline">
                <a href={`mailto:${klubb.kontaktEpost}`}>Kontakt klubben</a>
              </Button>
            </AdminFormActions>
          ) : null}
        </SettingsSection>
      </ContentDocument>
    </AdminPage>
  );
}
