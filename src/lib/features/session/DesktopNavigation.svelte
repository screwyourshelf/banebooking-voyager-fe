<script lang="ts">
  import {
    Login01Icon,
    Moon02Icon,
    Sun02Icon,
    TennisBallIcon,
    UserCircleIcon,
  } from "@hugeicons/core-free-icons";
  import {
    Icon,
    Navigation,
    NavigationAction,
    NavigationIdentity,
    NavigationLink,
    NavigationList,
    NavigationSection,
  } from "$lib/ui";
  import type { Theme } from "$lib/platform/theme";
  import NavigationItems from "./NavigationItems.svelte";
  import type { ReadyAppNavigationState } from "./navigation-model";

  let {
    navigation,
    onOpenAccount,
    onToggleTheme,
    theme,
  }: {
    navigation: ReadyAppNavigationState;
    onOpenAccount: () => void;
    onToggleTheme: () => void;
    theme: Theme;
  } = $props();
</script>

{#snippet identityIcon()}
  <Icon icon={TennisBallIcon} />
{/snippet}
{#snippet themeIcon()}
  <Icon icon={theme === "dark" ? Sun02Icon : Moon02Icon} />
{/snippet}
{#snippet accountIcon()}
  <Icon icon={UserCircleIcon} />
{/snippet}
{#snippet loginIcon()}
  <Icon icon={Login01Icon} />
{/snippet}

<Navigation label="Hovednavigasjon" layout="sidebar" surface="shell">
  <NavigationIdentity
    href={navigation.identity.href}
    logo={identityIcon}
    meta={navigation.identity.meta}
    name={navigation.identity.name}
  />

  <NavigationSection title="Konto og visning">
    <NavigationList>
      {#if navigation.account.authenticated}
        <NavigationAction
          icon={accountIcon}
          label={`${navigation.account.label} · ${navigation.account.roleLabel}`}
          onclick={onOpenAccount}
        />
      {:else}
        <NavigationLink href={navigation.loginHref} icon={loginIcon} label="Logg inn" />
      {/if}
      <NavigationAction
        icon={themeIcon}
        label={theme === "dark" ? "Bruk lyst tema" : "Bruk mørkt tema"}
        onclick={onToggleTheme}
      />
    </NavigationList>
  </NavigationSection>

  {#each navigation.desktopSections as section (section.id)}
    <NavigationSection title={section.label}>
      <NavigationItems items={section.items} />
    </NavigationSection>
  {/each}
</Navigation>
