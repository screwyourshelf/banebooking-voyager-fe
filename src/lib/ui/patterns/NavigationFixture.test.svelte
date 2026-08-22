<script lang="ts">
  import {
    Navigation,
    NavigationAction,
    NavigationIdentity,
    NavigationLink,
    NavigationList,
    NavigationLoading,
    NavigationSection,
  } from "../index";

  let {
    onBack,
    onTheme,
    pending = false,
    showAdmin = true,
  }: {
    onBack: () => void;
    onTheme: () => void;
    pending?: boolean;
    showAdmin?: boolean;
  } = $props();
</script>

{#snippet homeIcon()}
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7v9H4z"></path></svg>
{/snippet}

{#snippet newsIcon()}
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z"></path></svg>
{/snippet}

{#snippet arrowIcon()}
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"></path></svg>
{/snippet}

{#snippet themeIcon()}
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle></svg>
{/snippet}

<NavigationIdentity href="/fjordvik" name="Fjordvik Tennisklubb" meta="Banebooking">
  {#snippet logo()}<span>FT</span>{/snippet}
</NavigationIdentity>

<Navigation label="Hovednavigasjon" layout="sidebar">
  <NavigationSection title="Hovedmeny">
    <NavigationList>
      <NavigationLink href="/fjordvik" label="Book bane" active icon={homeIcon} />
      <NavigationLink
        href="/fjordvik/nyheter"
        label="Nyheter"
        icon={newsIcon}
        badge={{ label: "2", accessibleLabel: "2 uleste nyheter", tone: "accent" }}
      />
    </NavigationList>
  </NavigationSection>

  {#if showAdmin}
    <NavigationSection title="Administrasjon">
      <NavigationList>
        <NavigationLink href="/fjordvik/admin/baner" label="Baner og grener" />
      </NavigationList>
    </NavigationSection>
  {/if}
</Navigation>

<Navigation label="Mobilnavigasjon" layout="bottom">
  <NavigationList>
    <NavigationLink href="/fjordvik" label="Book" active icon={homeIcon} />
    <NavigationLink href="/fjordvik/bookinger" label="Mine tider" />
    <NavigationAction label="Mer" presentation="item" icon={newsIcon} />
  </NavigationList>
</Navigation>

<Navigation label="Baner og grener" layout="section">
  <NavigationList>
    <NavigationLink href="/fjordvik/admin/baner" label="Baner" active />
    <NavigationLink href="/fjordvik/admin/grener" label="Grener" />
  </NavigationList>
</Navigation>

<Navigation label="Kontohandlinger" layout="actions" busy={pending}>
  <NavigationList>
    <NavigationAction
      label="Alle brukere"
      presentation="back"
      icon={arrowIcon}
      onclick={onBack}
      disabled={pending}
      busy={pending}
    />
    <NavigationAction
      label="Bruk mørkt tema"
      presentation="icon"
      icon={themeIcon}
      onclick={onTheme}
      disabled={pending}
      busy={pending}
    />
  </NavigationList>
</Navigation>

<NavigationLoading label="Laster navigasjon" layout="sidebar" items={3} />
