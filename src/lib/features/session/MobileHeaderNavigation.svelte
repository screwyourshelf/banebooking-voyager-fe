<script lang="ts">
  import { Moon02Icon, News01Icon, Sun02Icon } from "@hugeicons/core-free-icons";
  import {
    Icon,
    Navigation,
    NavigationAction,
    NavigationIdentity,
    NavigationLink,
    NavigationList,
  } from "$lib/ui";
  import type { Theme } from "$lib/platform/theme";
  import type { ReadyAppNavigationState } from "./navigation-model";
  import TenantLogo from "./TenantLogo.svelte";

  let {
    navigation,
    onToggleTheme,
    theme,
  }: {
    navigation: ReadyAppNavigationState;
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
{#snippet newsIcon()}
  <Icon icon={News01Icon} />
{/snippet}

<NavigationIdentity
  href={navigation.identity.href}
  logo={identityIcon}
  name={navigation.identity.name}
/>
<Navigation label="Mobilverktøy" layout="actions">
  <NavigationList>
    <NavigationAction
      icon={themeIcon}
      label={theme === "dark" ? "Bruk lyst tema" : "Bruk mørkt tema"}
      onclick={onToggleTheme}
      presentation="icon"
    />
    <NavigationLink
      badge={navigation.newsBadge}
      href={navigation.newsHref}
      icon={newsIcon}
      label="Nyheter"
      presentation="icon"
    />
  </NavigationList>
</Navigation>
