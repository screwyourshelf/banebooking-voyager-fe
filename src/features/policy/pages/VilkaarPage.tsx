import { CircleAlert } from "lucide-react";

import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { useKlubb } from "@/hooks/useKlubb";
import { AKTIV_VILKAAR } from "./vilkaar";
import { Page, Document } from "@/components";

export default function VilkaarPage() {
  const { data: klubb, isLoading, error, refetch } = useKlubb();

  if (isLoading) {
    return (
      <Page
        eyebrow="Personvern"
        title="Vilkår for bruk"
        description="Les om ansvar, personvern og bruk av tjenesten."
      >
        <Page.Loading label="Laster vilkår" />
      </Page>
    );
  }

  if (error || !klubb) {
    return (
      <Page
        eyebrow="Personvern"
        title="Vilkår for bruk"
        description="Les om ansvar, personvern og bruk av tjenesten."
      >
        <Page.State>
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
        </Page.State>
      </Page>
    );
  }

  return (
    <Page
      eyebrow="Personvern"
      title="Vilkår for bruk"
      description="Les om ansvar, personvern og bruk av tjenesten."
      actions={<RecordStatus tone="past">Oppdatert {AKTIV_VILKAAR.visningsDato}</RecordStatus>}
    >
      <Document>
        <Document.Intro>
          Disse vilkårene gjelder for bruk av Banebooking i <strong>{klubb.navn}</strong>. Ved å
          logge inn samtykker du til vilkårene.
        </Document.Intro>

        <Document.Section title="1. Bruk av tjenesten">
          <p>
            Banebooking lar deg booke baner i <strong>{klubb.navn}</strong>. Du må være medlem eller
            ha fått tilgang av en klubbadministrator.
          </p>
          <p>
            Ved å gjennomføre en booking bekrefter du at du og eventuelle medspillere har gyldig
            betalt medlemskap for inneværende år.
          </p>
        </Document.Section>

        <Document.Section title="2. Konto og innlogging">
          <p>
            Innlogging i tjenesten skjer via e-post eller tredjepartsleverandører for autentisering,
            for eksempel Google og Idrettens ID. Banebooking bruker lokal lagring i nettleseren for
            å bevare innlogging mellom økter, valgt klubb og enkelte visningsinnstillinger.
          </p>
          <p>
            Banebooking setter ikke egne informasjonskapsler. Eksterne innloggingsleverandører kan
            bruke nødvendige informasjonskapsler på sine egne nettsteder. Lokal lagring og slike
            informasjonskapsler brukes ikke av Banebooking til reklame, sporing av personer eller
            analyse av brukeratferd.
          </p>
          <p>
            Dersom nettleseren blokkerer lokal lagring, kan offentlige sider fortsatt brukes.
            Innlogging og funksjoner som krever en konto, krever at lokal lagring er tilgjengelig.
          </p>
        </Document.Section>

        <Document.Section title="3. Personopplysninger">
          <p>
            Vi lagrer nødvendige personopplysninger som navn, e-postadresse og bookinghistorikk for
            å kunne levere tjenesten. Du kan når som helst se, laste ned eller slette dataene dine
            via <em>Min side</em>.
          </p>
          <p>
            For å oppdage og rette tekniske feil bruker Banebooking Sentry. Ved en feil kan tekniske
            opplysninger om feilen, nettleseren, operativsystemet og den aktuelle siden sendes til
            Sentry. Feilrapporteringen er konfigurert uten brukeropplysninger og uten innhold fra
            HTTP-forespørslers meldingskropp.
          </p>
        </Document.Section>

        <Document.Section title="4. Bruk, ansvar og misbruk">
          <p>
            Ved misbruk av bookingløsningen eller brudd på klubbens retningslinjer kan tilgangen bli
            begrenset eller fjernet av en klubbadministrator.
          </p>
          <p>
            {klubb.navn} tar ikke ansvar for tap, kostnader eller ulemper som følge av tekniske
            feil, dobbeltbookinger eller midlertidig utilgjengelighet i systemet.
          </p>
        </Document.Section>

        <Document.Section title="5. Endringer i tjenesten">
          <p>
            Funksjonalitet og vilkår kan endres over tid. Ved vesentlige endringer vil du bli bedt
            om å godta oppdaterte vilkår ved neste innlogging.
          </p>
        </Document.Section>

        <Document.Section title="6. Kontakt">
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
        </Document.Section>
      </Document>
    </Page>
  );
}
