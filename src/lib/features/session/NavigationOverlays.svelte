<script lang="ts">
  import { Login01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
  import {
    Icon,
    Navigation,
    NavigationAction,
    NavigationLink,
    NavigationList,
    NavigationOverlay,
    NavigationSection,
  } from "$lib/ui";
  import NavigationItems from "./NavigationItems.svelte";
  import type { ReadyAppNavigationState } from "./navigation-model";

  let {
    accountOpen = $bindable(false),
    moreOpen = $bindable(false),
    navigation,
    onSignOut,
    signingOut,
  }: {
    accountOpen?: boolean;
    moreOpen?: boolean;
    navigation: ReadyAppNavigationState;
    onSignOut: () => void;
    signingOut: boolean;
  } = $props();

  const personalSection = $derived(
    navigation.desktopSections.find((section) => section.id === "personal")
  );
</script>

{#snippet logoutIcon()}
  <Icon icon={Logout01Icon} />
{/snippet}
{#snippet loginIcon()}
  <Icon icon={Login01Icon} />
{/snippet}

<NavigationOverlay
  bind:open={accountOpen}
  description={navigation.account.email ?? navigation.account.roleLabel}
  pending={signingOut}
  presentation="account"
  title={navigation.account.label}
>
  {#snippet children({ close })}
    <Navigation label="Kontomeny" layout="sidebar" surface="overlay" busy={signingOut}>
      {#if personalSection}
        <NavigationSection title={personalSection.label}>
          <NavigationItems items={personalSection.items} onNavigate={close} />
        </NavigationSection>
      {/if}
      <NavigationSection title="Økt">
        <NavigationList>
          <NavigationAction
            busy={signingOut}
            disabled={signingOut}
            icon={logoutIcon}
            label="Logg ut"
            onclick={onSignOut}
          />
        </NavigationList>
      </NavigationSection>
    </Navigation>
  {/snippet}
</NavigationOverlay>

<NavigationOverlay
  bind:open={moreOpen}
  description={navigation.account.email ?? navigation.account.roleLabel}
  pending={signingOut}
  presentation="more"
  title={navigation.account.label}
>
  {#snippet children({ close })}
    <Navigation label="Mer" layout="sidebar" surface="overlay" busy={signingOut}>
      {#each navigation.mobileSecondary as section (section.id)}
        <NavigationSection title={section.label}>
          <NavigationItems items={section.items} onNavigate={close} />
        </NavigationSection>
      {/each}
      <NavigationSection title="Konto">
        <NavigationList>
          {#if navigation.account.authenticated}
            <NavigationAction
              busy={signingOut}
              disabled={signingOut}
              icon={logoutIcon}
              label="Logg ut"
              onclick={onSignOut}
            />
          {:else}
            <NavigationLink
              href={navigation.loginHref}
              icon={loginIcon}
              label="Logg inn"
              onclick={close}
            />
          {/if}
        </NavigationList>
      </NavigationSection>
    </Navigation>
  {/snippet}
</NavigationOverlay>
