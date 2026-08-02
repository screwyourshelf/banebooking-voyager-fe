import { CircleAlert } from "lucide-react";
import { AdminPage, AdminPageLoading, AdminPageState } from "@/components/admin";
import { ContentDocument, ContentDocumentIntro, ContentDocumentSection } from "@/components/layout";
import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useKlubb } from "@/hooks/useKlubb";
import { AKTIV_VILKAAR } from "./vilkaar";

export default function VilkaarPage() {
  const { data: klubb, isLoading, error, refetch } = useKlubb();

  if (isLoading) {
    return (
      <AdminPage
        eyebrow="Personvern"
        title="Vilkår for bruk"
        description="Les om ansvar, personvern og bruk av tjenesten."
      >
        <AdminPageLoading label="Laster vilkår" />
      </AdminPage>
    );
  }

  if (error || !klubb) {
    return (
      <AdminPage
        eyebrow="Personvern"
        title="Vilkår for bruk"
        description="Les om ansvar, personvern og bruk av tjenesten."
      >
        <AdminPageState>
          <RecordListState
            icon={<CircleAlert aria-hidden="true" />}
            title="Kunne ikke laste vilkårene"
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
      eyebrow="Personvern"
      title="Vilkår for bruk"
      description="Les om ansvar, personvern og bruk av tjenesten."
      action={<RecordStatus tone="past">Oppdatert {AKTIV_VILKAAR.visningsDato}</RecordStatus>}
    >
      <ContentDocument>
        <ContentDocumentIntro>
          Disse vilkårene gjelder for bruk av Banebooking i <strong>{klubb.navn}</strong>. Ved å
          logge inn samtykker du til vilkårene.
        </ContentDocumentIntro>

        <ContentDocumentSection title="1. Bruk av tjenesten">
          <p>
            Banebooking lar deg booke baner i <strong>{klubb.navn}</strong>. Du må være medlem eller
            ha fått tilgang av en klubbadministrator.
          </p>
          <p>
            Ved å gjennomføre en booking bekrefter du at du og eventuelle medspillere har gyldig
            betalt medlemskap for inneværende år.
          </p>
        </ContentDocumentSection>

        <ContentDocumentSection title="2. Konto og innlogging">
          <p>
            Innlogging i tjenesten skjer via e-post eller tredjepartsleverandører for autentisering,
            for eksempel Google. For å holde brukeren innlogget mellom økter benyttes lokal lagring
            i nettleseren. Tjenesten benytter ikke informasjonskapsler til sporing eller analyse.
          </p>
        </ContentDocumentSection>

        <ContentDocumentSection title="3. Personopplysninger">
          <p>
            Vi lagrer nødvendige personopplysninger som navn, e-postadresse og bookinghistorikk for
            å kunne levere tjenesten. Du kan når som helst se, laste ned eller slette dataene dine
            via <em>Min side</em>.
          </p>
        </ContentDocumentSection>

        <ContentDocumentSection title="4. Bruk, ansvar og misbruk">
          <p>
            Ved misbruk av bookingløsningen eller brudd på klubbens retningslinjer kan tilgangen bli
            begrenset eller fjernet av en klubbadministrator.
          </p>
          <p>
            {klubb.navn} tar ikke ansvar for tap, kostnader eller ulemper som følge av tekniske
            feil, dobbeltbookinger eller midlertidig utilgjengelighet i systemet.
          </p>
        </ContentDocumentSection>

        <ContentDocumentSection title="5. Endringer i tjenesten">
          <p>
            Funksjonalitet og vilkår kan endres over tid. Ved vesentlige endringer vil du bli bedt
            om å godta oppdaterte vilkår ved neste innlogging.
          </p>
        </ContentDocumentSection>

        <ContentDocumentSection title="6. Kontakt">
          <p>
            Spørsmål om tjenesten, personvern eller vilkår kan rettes til klubbens kontaktperson
            {klubb.kontaktEpost ? (
              <>
                {" "}
                eller via e-post til{" "}
                <a href={`mailto:${klubb.kontaktEpost}`}>{klubb.kontaktEpost}</a>.
              </>
            ) : (
              "."
            )}
          </p>
        </ContentDocumentSection>
      </ContentDocument>
    </AdminPage>
  );
}
