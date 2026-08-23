<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { untrack } from "svelte";
  import type { KlubbRespons } from "$lib/contracts";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    Input,
    SettingsSection,
    SettingsStack,
  } from "$lib/ui";
  import {
    createClubSettingsDraft,
    isClubSettingsDirty,
    MAX_CLUB_NAME_LENGTH,
    toUpdateClubRequest,
    validateClubSettings,
    type ClubSettingsField,
  } from "./model";
  import { updateClubMutationOptions } from "./queries";

  let { club }: { club: KlubbRespons } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const update = createMutation(() => updateClubMutationOptions(api, queryClient, tenant.slug));
  let synchronizedClub = $state("");
  let draft = $state(untrack(() => createClubSettingsDraft(club)));
  let submitted = $state(false);
  let touched = $state<Partial<Record<ClubSettingsField, boolean>>>({});
  const errors = $derived(validateClubSettings(draft));
  const dirty = $derived(isClubSettingsDirty(draft, club));
  const valid = $derived(!Object.values(errors).some(Boolean));
  const canSubmit = $derived(dirty && valid);

  $effect(() => {
    const signature = JSON.stringify(createClubSettingsDraft(club));
    if (signature === synchronizedClub || update.isPending) return;
    synchronizedClub = signature;
    draft = createClubSettingsDraft(club);
    submitted = false;
    touched = {};
  });

  function visibleError(field: ClubSettingsField) {
    return submitted || touched[field] ? errors[field] : null;
  }

  function change(field: ClubSettingsField) {
    touched[field] = true;
    update.reset();
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (update.isPending) return;
    submitted = true;

    const request = toUpdateClubRequest(draft, club);
    if (!request) {
      const firstInvalid = (
        ["name", "contactEmail", "latitude", "longitude", "feedDays"] as ClubSettingsField[]
      ).find((field) => errors[field]);
      if (firstInvalid) {
        (event.currentTarget as HTMLFormElement)
          .querySelector<HTMLElement>(`#club-${firstInvalid}`)
          ?.focus();
      }
      return;
    }

    void update.mutateAsync(request).catch(() => undefined);
  }
</script>

<Form onsubmit={submit} pending={update.isPending}>
  <SettingsStack>
    <SettingsSection
      eyebrow="Profil"
      title="Klubbinformasjon"
      description="Navn og kontaktpunkter medlemmene møter."
    >
      <FormFields>
        <FormField label="Klubbnavn" controlId="club-name" error={visibleError("name")} required>
          <Input
            name="navn"
            placeholder="Ås tennisklubb"
            autocomplete="organization"
            maxlength={MAX_CLUB_NAME_LENGTH}
            bind:value={draft.name}
            disabled={update.isPending}
            oninput={() => change("name")}
          />
        </FormField>

        <FormField
          label="Kontakt-e-post"
          description="Vises i klubbens kontaktinformasjon."
          controlId="club-contactEmail"
          error={visibleError("contactEmail")}
          required
        >
          <Input
            name="kontaktEpost"
            type="email"
            placeholder="post@klubb.no"
            inputmode="email"
            autocomplete="email"
            bind:value={draft.contactEmail}
            disabled={update.isPending}
            oninput={() => change("contactEmail")}
          />
        </FormField>

        <FormField
          label="Nettside"
          description="Valgfri lenke til klubbens nettside."
          controlId="club-website"
        >
          <Input
            name="nettside"
            type="url"
            placeholder="https://www.aastk.no"
            inputmode="url"
            bind:value={draft.website}
            disabled={update.isPending}
            oninput={() => change("website")}
          />
        </FormField>
      </FormFields>
    </SettingsSection>

    <SettingsSection
      eyebrow="Sted"
      title="Vær og posisjon"
      description="Koordinatene brukes til lokal værinformasjon i Book bane."
    >
      <FormFields>
        <FormField
          label="Breddegrad"
          description="Desimalgrader mellom −90 og 90."
          controlId="club-latitude"
          error={visibleError("latitude")}
        >
          <Input
            name="latitude"
            placeholder="59.6552"
            inputmode="decimal"
            bind:value={draft.latitude}
            disabled={update.isPending}
            oninput={() => change("latitude")}
          />
        </FormField>

        <FormField
          label="Lengdegrad"
          description="Desimalgrader mellom −180 og 180."
          controlId="club-longitude"
          error={visibleError("longitude")}
        >
          <Input
            name="longitude"
            placeholder="10.7769"
            inputmode="decimal"
            bind:value={draft.longitude}
            disabled={update.isPending}
            oninput={() => change("longitude")}
          />
        </FormField>
      </FormFields>
    </SettingsSection>

    <SettingsSection
      eyebrow="Innhold"
      title="Nyhetsfeed"
      description="Vis nyheter fra klubbens RSS-feed i Banebooking."
    >
      <FormFields>
        <FormField
          label="RSS-feed"
          description="Valgfri adresse til feeden."
          controlId="club-feedUrl"
        >
          <Input
            name="feedUrl"
            type="url"
            placeholder="https://www.aastk.no/?feed=rss2"
            inputmode="url"
            bind:value={draft.feedUrl}
            disabled={update.isPending}
            oninput={() => change("feedUrl")}
          />
        </FormField>

        <FormField
          label="Vis innlegg i"
          description="Antall dager, fra 1 til 150."
          controlId="club-feedDays"
          error={visibleError("feedDays")}
        >
          <Input
            name="feedSynligAntallDager"
            type="number"
            inputmode="numeric"
            min={1}
            max={150}
            step={1}
            bind:value={draft.feedDays}
            disabled={update.isPending}
            oninput={() => change("feedDays")}
          />
        </FormField>
      </FormFields>
    </SettingsSection>

    <FormActions embedded={false}>
      {#if update.isError}
        <Feedback
          tone="danger"
          title="Klubbinnstillingene kunne ikke lagres"
          description={update.error instanceof Error ? update.error.message : "Prøv igjen."}
        />
      {:else if update.isSuccess}
        <Feedback tone="success" title="Klubbinnstillingene er lagret" />
      {/if}
      <FormSubmit pending={update.isPending} pendingLabel="Lagrer …" disabled={!canSubmit}>
        Lagre endringer
      </FormSubmit>
    </FormActions>
  </SettingsStack>
</Form>
