<script lang="ts">
  import { Login01Icon, Moon02Icon, Sun02Icon, UserCircleIcon } from "@hugeicons/core-free-icons";
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
  import TenantLogo from "./TenantLogo.svelte";
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
  <TenantLogo sources={navigation.identity.logoSources} />
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
{#snippet header()}
  <NavigationIdentity
    href={navigation.identity.href}
    logo={identityIcon}
    meta={navigation.identity.meta}
    name={navigation.identity.name}
  />
{/snippet}
{#snippet footer()}
  <NavigationList>
    <NavigationAction
      icon={themeIcon}
      label={theme === "dark" ? "Bruk lyst tema" : "Bruk mørkt tema"}
      onclick={onToggleTheme}
    />
    {#if navigation.account.authenticated}
      <NavigationAction
        icon={accountIcon}
        label={`${navigation.account.label} · ${navigation.account.roleLabel}`}
        onclick={onOpenAccount}
      />
    {:else}
      <NavigationLink href={navigation.loginHref} icon={loginIcon} label="Logg inn" />
    {/if}
  </NavigationList>
{/snippet}

<Navigation {footer} {header} label="Hovednavigasjon" layout="sidebar" surface="shell">
  {#each navigation.desktopSections as section (section.id)}
    {#if section.id === "overview"}
      <NavigationItems items={section.items} />
    {:else}
      <NavigationSection title={section.label}>
        <NavigationItems items={section.items} />
      </NavigationSection>
    {/if}
  {/each}
</Navigation>
