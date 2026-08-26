<script lang="ts">
  import type { BrukerRespons } from "$lib/contracts";
  import {
    ErrorState,
    Navigation,
    NavigationLink,
    NavigationList,
    Page,
    PageLoading,
  } from "$lib/ui";
  import type { AccountTab } from "./model";
  import PersonalDataSettings from "./PersonalDataSettings.svelte";
  import ProfileSettings from "./ProfileSettings.svelte";

  let {
    activeTab,
    dataHref,
    isFetching = false,
    onRetry,
    onUserUpdated,
    profileHref,
    status,
    termsHref,
    user,
  }: {
    activeTab: AccountTab;
    dataHref: string;
    isFetching?: boolean;
    onRetry: () => Promise<unknown>;
    onUserUpdated: () => Promise<unknown>;
    profileHref: string;
    status: "error" | "pending" | "success";
    termsHref: string;
    user: BrukerRespons | null | undefined;
  } = $props();
</script>

{#if status === "pending"}
  <PageLoading label="Laster profilen" />
{:else if status === "error" || !user}
  <Page eyebrow="Min konto" title="Min side">
    <ErrorState
      title="Kunne ikke laste profilen"
      description="Prøv igjen om litt."
      isRetrying={isFetching}
      onRetry={() => void onRetry()}
    />
  </Page>
{:else}
  <Page
    eyebrow="Min konto"
    title="Min side"
    description="Oppdater profilen og få innsyn i dataene som er lagret om deg."
  >
    <Navigation label="Områder på Min side" layout="section" busy={isFetching}>
      <NavigationList>
        <NavigationLink href={profileHref} label="Profil" active={activeTab === "profil"} />
        <NavigationLink href={dataHref} label="Data" active={activeTab === "persondata"} />
      </NavigationList>
    </Navigation>

    {#if activeTab === "persondata"}
      <PersonalDataSettings {user} {termsHref} />
    {:else}
      <ProfileSettings {user} {onUserUpdated} />
    {/if}
  </Page>
{/if}
