<script lang="ts">
  import {
    Calendar03Icon,
    CalendarAdd01Icon,
    CalendarCheckIn01Icon,
    CalendarSetting01Icon,
    ChartLineData01Icon,
    Layers01Icon,
    Megaphone01Icon,
    MoreHorizontalIcon,
    News01Icon,
    Settings01Icon,
    UserCircleIcon,
    UserMultiple02Icon,
  } from "@hugeicons/core-free-icons";
  import { Icon, NavigationLink, NavigationList, type IconData } from "$lib/ui";
  import type { Snippet } from "svelte";
  import type { AppNavigationIcon, AppNavigationItem } from "./navigation-model";

  let {
    items,
    mobileLabels = false,
    onNavigate,
    trailing,
  }: {
    items: readonly AppNavigationItem[];
    mobileLabels?: boolean;
    onNavigate?: () => void;
    trailing?: Snippet;
  } = $props();

  const icons: Record<AppNavigationIcon, IconData> = {
    account: UserCircleIcon,
    announcements: Megaphone01Icon,
    booking: CalendarAdd01Icon,
    calendar: Calendar03Icon,
    courts: Layers01Icon,
    "events-admin": CalendarSetting01Icon,
    more: MoreHorizontalIcon,
    "my-bookings": CalendarCheckIn01Icon,
    news: News01Icon,
    settings: Settings01Icon,
    statistics: ChartLineData01Icon,
    users: UserMultiple02Icon,
  };
</script>

<NavigationList>
  {#each items as item (item.id)}
    {#snippet itemIcon()}
      <Icon icon={icons[item.icon]} />
    {/snippet}
    <NavigationLink
      active={item.active}
      href={item.href}
      icon={itemIcon}
      label={mobileLabels ? (item.mobileLabel ?? item.label) : item.label}
      onclick={onNavigate}
    />
  {/each}
  {@render trailing?.()}
</NavigationList>
