<script lang="ts">
  import { resolve } from "$app/paths";
  import {
    AppShell,
    Navigation,
    NavigationAction,
    NavigationIdentity,
    NavigationLink,
    NavigationList,
  } from "../index";

  let { onTheme }: { onTheme: () => void } = $props();
</script>

{#snippet desktopNavigation()}
  <NavigationIdentity href="/fjordvik" name="Fjordvik Tennisklubb" meta="Banebooking" />
  <Navigation label="Hovednavigasjon" layout="sidebar">
    <NavigationList>
      <NavigationLink href="/fjordvik" label="Book bane" active />
    </NavigationList>
  </Navigation>
{/snippet}

{#snippet mobileHeader()}
  <NavigationIdentity href="/fjordvik" name="Fjordvik Tennisklubb" />
  <Navigation label="Mobilverktøy" layout="actions">
    <NavigationList>
      <NavigationAction label="Bytt tema" presentation="item" onclick={onTheme} />
    </NavigationList>
  </Navigation>
{/snippet}

{#snippet mobileNavigation()}
  <Navigation label="Mobilnavigasjon" layout="bottom">
    <NavigationList>
      <NavigationLink href="/fjordvik" label="Book" active />
      <NavigationLink href="/fjordvik/arrangementer" label="Arrangementer" />
    </NavigationList>
  </Navigation>
{/snippet}

<AppShell {desktopNavigation} {mobileHeader} {mobileNavigation}>
  <a href={resolve("/fjordvik/nyheter")}>Siste nytt</a>
</AppShell>
