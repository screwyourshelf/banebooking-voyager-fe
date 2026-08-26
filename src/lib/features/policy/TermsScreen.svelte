<script lang="ts">
  import type { KlubbRespons } from "$lib/contracts";
  import { AKTIV_VILKAAR } from "$lib/domain";
  import { Document, DocumentIntro, DocumentSection, Page } from "$lib/ui";

  let { klubb }: { klubb: KlubbRespons } = $props();
</script>

{#snippet updatedStatus()}
  <span>Oppdatert {AKTIV_VILKAAR.visningsDato}</span>
{/snippet}

<Page
  eyebrow="Personvern"
  title="Vilkår for bruk"
  description="Les om ansvar, personvern og bruk av tjenesten."
  actions={updatedStatus}
>
  <Document label="Vilkår for bruk">
    <DocumentIntro>
      <p>
        Disse vilkårene gjelder for bruk av Banebooking i <strong>{klubb.navn}</strong>. Ved å logge
        inn samtykker du til vilkårene.
      </p>
    </DocumentIntro>

    <DocumentSection title="1. Bruk av tjenesten">
      <p>
        Banebooking lar deg booke baner i <strong>{klubb.navn}</strong>. Du må være medlem eller ha
        fått tilgang av en klubbadministrator.
      </p>
      <p>
        Ved å gjennomføre en booking bekrefter du at du og eventuelle medspillere har gyldig betalt
        medlemskap for inneværende år.
      </p>
    </DocumentSection>

    <DocumentSection title="2. Konto og innlogging">
      <p>
        Innlogging skjer via e-post eller tredjepartsleverandører, for eksempel Google og Idrettens
        ID. Banebooking bruker lokal lagring for å bevare innlogging, valgt klubb og enkelte
        visningsinnstillinger.
      </p>
      <p>
        Banebooking setter ikke egne informasjonskapsler. Eksterne innloggingsleverandører kan bruke
        nødvendige informasjonskapsler på sine egne nettsteder. Opplysningene brukes ikke av
        Banebooking til reklame, personsporing eller analyse av brukeratferd.
      </p>
      <p>
        Dersom nettleseren blokkerer lokal lagring, kan offentlige sider fortsatt brukes. Innlogging
        og funksjoner som krever en konto, krever at lokal lagring er tilgjengelig.
      </p>
    </DocumentSection>

    <DocumentSection title="3. Personopplysninger">
      <p>
        Vi lagrer nødvendige personopplysninger som navn, e-postadresse og bookinghistorikk for å
        kunne levere tjenesten. Du kan se, laste ned eller slette dataene dine via <em>Min side</em
        >.
      </p>
      <p>
        For å oppdage og rette tekniske feil bruker Banebooking Sentry. Feilrapporteringen er
        konfigurert uten brukeropplysninger og uten innhold fra HTTP-forespørslers meldingskropp.
      </p>
    </DocumentSection>

    <DocumentSection title="4. Bruk, ansvar og misbruk">
      <p>
        Ved misbruk av bookingløsningen eller brudd på klubbens retningslinjer kan tilgangen bli
        begrenset eller fjernet av en klubbadministrator.
      </p>
      <p>
        {klubb.navn} tar ikke ansvar for tap, kostnader eller ulemper som følge av tekniske feil, dobbeltbookinger
        eller midlertidig utilgjengelighet i systemet.
      </p>
    </DocumentSection>

    <DocumentSection title="5. Endringer i tjenesten">
      <p>
        Funksjonalitet og vilkår kan endres over tid. Ved vesentlige endringer blir du bedt om å
        godta oppdaterte vilkår ved neste innlogging.
      </p>
    </DocumentSection>

    <DocumentSection title="6. Kontakt">
      <p>
        {#if klubb.kontaktEpost}
          Spørsmål om tjenesten, personvern eller vilkår kan rettes til klubbens kontaktperson eller
          via e-post til <a href={`mailto:${klubb.kontaktEpost}`}>{klubb.kontaktEpost}</a>.
        {:else}
          Spørsmål om tjenesten, personvern eller vilkår kan rettes til klubbens kontaktperson.
        {/if}
      </p>
    </DocumentSection>
  </Document>
</Page>
