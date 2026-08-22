<script lang="ts">
  import { AppShell } from "$lib/ui";
  import DesktopNavigation from "./DesktopNavigation.svelte";
  import MobileBottomNavigation from "./MobileBottomNavigation.svelte";
  import MobileHeaderNavigation from "./MobileHeaderNavigation.svelte";
  import NavigationOverlays from "./NavigationOverlays.svelte";
  import { buildAppNavigationState } from "./navigation-model";

  let {
    onSignOut,
    onTheme,
  }: {
    onSignOut: () => void;
    onTheme: () => void;
  } = $props();

  const builtNavigation = buildAppNavigationState({
    auth: {
      status: "authenticated",
      user: {
        id: "user-1",
        email: "kari@example.no",
        name: "Kari Nordmann",
        source: "supabase",
      },
    },
    bruker: {
      status: "success",
      data: {
        id: "user-1",
        epost: "kari@example.no",
        visningsnavn: "Kari",
        roller: ["KlubbAdmin"],
        kapabiliteter: ["baner:admin", "brukere:lese"],
      },
    },
    klubb: {
      status: "success",
      data: { slug: "fjordvik", navn: "Fjordvik Tennisklubb", feedSynligAntallDager: 30 },
    },
    pathname: "/fjordvik/admin/grener",
    tenant: { slug: "fjordvik", source: "route" },
  });

  if (builtNavigation.status !== "ready") throw new Error("Fixture krever klar navigasjon");
  const navigation = builtNavigation;
  let accountOpen = $state(false);
  let moreOpen = $state(false);
  let theme = $state<"dark" | "light">("light");

  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light";
    onTheme();
  }
</script>

<AppShell>
  {#snippet desktopNavigation()}
    <DesktopNavigation
      {navigation}
      onOpenAccount={() => (accountOpen = true)}
      onToggleTheme={toggleTheme}
      {theme}
    />
  {/snippet}
  {#snippet mobileHeader()}
    <MobileHeaderNavigation {navigation} onToggleTheme={toggleTheme} {theme} />
  {/snippet}
  {#snippet mobileNavigation()}
    <MobileBottomNavigation {navigation} onOpenMore={() => (moreOpen = true)} />
  {/snippet}
  <p>Arbeidsflate</p>
</AppShell>

<NavigationOverlays bind:accountOpen bind:moreOpen {navigation} {onSignOut} signingOut={false} />
