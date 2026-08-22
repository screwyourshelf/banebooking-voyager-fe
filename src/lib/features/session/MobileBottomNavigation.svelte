<script lang="ts">
  import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
  import { Icon, Navigation, NavigationAction } from "$lib/ui";
  import NavigationItems from "./NavigationItems.svelte";
  import type { ReadyAppNavigationState } from "./navigation-model";

  let {
    navigation,
    onOpenMore,
  }: {
    navigation: ReadyAppNavigationState;
    onOpenMore: () => void;
  } = $props();
</script>

{#snippet moreIcon()}
  <Icon icon={MoreHorizontalIcon} />
{/snippet}
{#snippet moreAction()}
  <NavigationAction icon={moreIcon} label="Mer" onclick={onOpenMore} />
{/snippet}

<Navigation label="Mobilnavigasjon" layout="bottom">
  <NavigationItems items={navigation.mobilePrimary} mobileLabels trailing={moreAction} />
</Navigation>
