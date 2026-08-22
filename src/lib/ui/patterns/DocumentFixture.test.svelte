<script lang="ts">
  import Document from "./Document.svelte";
  import DocumentFacts from "./DocumentFacts.svelte";
  import DocumentIntro from "./DocumentIntro.svelte";
  import DocumentSection from "./DocumentSection.svelte";
  import Page from "./Page.svelte";

  const facts = [
    { label: "Åpningstid", value: "07:00–23:00" },
    { label: "Varighet", value: "60 minutter" },
  ] as const;
</script>

{#snippet metadata()}
  <span>Oppdatert 22. august 2026</span>
{/snippet}

<Page
  eyebrow="Personvern"
  title="Vilkår for bruk"
  description="Les om ansvar, personvern og bruk av tjenesten."
  actions={metadata}
  standalone
>
  <Document label="Vilkårsdokument">
    <DocumentIntro>
      <p>Disse vilkårene gjelder for bruk av Banebooking i Fjordvik IL.</p>
      <p>
        Spørsmål kan sendes til <a href="mailto:booking@fjordvik.no">booking@fjordvik.no</a>.
      </p>
    </DocumentIntro>

    <DocumentSection title="1. Bruk av tjenesten" description="Dette gjelder alle som booker.">
      <p>Du må være medlem eller ha fått tilgang av en klubbadministrator.</p>
      <a href="#medlemskap">Les om medlemskap</a>
    </DocumentSection>

    <DocumentSection title="2. Bookingregler">
      <DocumentFacts items={facts} label="Gjeldende bookingregler" />
    </DocumentSection>
  </Document>
</Page>
