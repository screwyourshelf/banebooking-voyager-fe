<script lang="ts">
  import type { KlubbRespons } from "$lib/contracts";
  import {
    ButtonLink,
    Document,
    DocumentIntro,
    FormActions,
    Page,
    PageStatus,
    SettingsPanel,
    SettingsRow,
    SettingsSection,
    SettingsText,
  } from "$lib/ui";

  let { klubb }: { klubb: KlubbRespons } = $props();
</script>

{#snippet accountStatus()}
  <PageStatus label="Sperret" tone="danger" />
{/snippet}

<Page
  eyebrow="Tilgang"
  title="Kontoen er sperret"
  description="Du kan ikke bruke Banebooking før klubben opphever sperren."
  actions={accountStatus}
>
  <Document label="Sperreinformasjon">
    <DocumentIntro>
      <p>Du kan ikke booke baner eller melde deg på arrangementer mens sperren er aktiv.</p>
    </DocumentIntro>

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

      {#if klubb.kontaktEpost}
        <FormActions>
          <ButtonLink href={`mailto:${klubb.kontaktEpost}`}>Kontakt klubben</ButtonLink>
        </FormActions>
      {/if}
    </SettingsSection>
  </Document>
</Page>
