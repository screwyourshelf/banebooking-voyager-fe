<script lang="ts">
  import { createMutation } from "@tanstack/svelte-query";
  import type { BrukerRespons } from "$lib/contracts";
  import { formatDatoKort, tilDatoTekst } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    ButtonLink,
    Feedback,
    FormActions,
    SettingsPanel,
    SettingsRow,
    SettingsSection,
    SettingsStack,
    SettingsValue,
  } from "$lib/ui";
  import { myAccountDataMutationOptions } from "./queries";

  let { termsHref, user }: { termsHref: string; user: BrukerRespons } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const browser = typeof document !== "undefined";
  const download = createMutation(() => myAccountDataMutationOptions(api, tenant.slug));

  async function downloadInBrowser() {
    if (!browser || download.isPending) return;
    try {
      const data = await download.mutateAsync();
      const { downloadJsonFile } = await import("$lib/platform/download/download-json.client");
      downloadJsonFile(data, `banebooking-data-${tilDatoTekst(new Date())}.json`);
    } catch {
      // Mutasjonen beholder nedlastingsfeilen ved den lokale handlingen.
    }
  }
</script>

<SettingsStack>
  <SettingsSection
    eyebrow="Personvern"
    title="Vilkår og samtykke"
    description="Se når og hvilken versjon du godtok."
  >
    <SettingsPanel>
      <SettingsRow title="Status" description="Vilkårene aksepteres ved første innlogging.">
        <SettingsValue>{user.vilkårAkseptertDato ? "Akseptert" : "Ikke registrert"}</SettingsValue>
      </SettingsRow>
      {#if user.vilkårAkseptertDato}
        <SettingsRow title="Akseptert dato">
          <SettingsValue>{formatDatoKort(user.vilkårAkseptertDato)}</SettingsValue>
        </SettingsRow>
      {/if}
      {#if user.vilkårVersjon}
        <SettingsRow title="Versjon"
          ><SettingsValue>{user.vilkårVersjon}</SettingsValue></SettingsRow
        >
      {/if}
    </SettingsPanel>
    <FormActions align="start">
      <ButtonLink href={termsHref} target="_blank" rel="noopener noreferrer">
        Les vilkårene
      </ButtonLink>
    </FormActions>
  </SettingsSection>

  <SettingsSection
    eyebrow="Eksport"
    title="Dine data"
    description="Last ned opplysningene Banebooking har lagret om deg."
  >
    <SettingsPanel>
      <SettingsRow title="Datafil" description="JSON med kontoopplysninger og bookede tider.">
        <SettingsValue>JSON</SettingsValue>
      </SettingsRow>
    </SettingsPanel>
    <FormActions align="start">
      {#if download.isError}
        <Feedback
          tone="danger"
          title="Datafilen kunne ikke lastes ned"
          description={download.error instanceof Error ? download.error.message : "Prøv igjen."}
        />
      {/if}
      <Button variant="secondary" disabled={download.isPending} onclick={downloadInBrowser}>
        {download.isPending ? "Laster ned …" : "Last ned data"}
      </Button>
    </FormActions>
  </SettingsSection>
</SettingsStack>
