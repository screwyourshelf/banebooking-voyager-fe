<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import SettingsRowFrame from "./SettingsRowFrame.svelte";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
    children?: Snippet;
    description?: string;
    right?: Snippet;
    title: string;
  };

  let { children, description, right, title, ...attributes }: Props = $props();
</script>

<SettingsRowFrame {...attributes} kind="default" {title} {description} {right} {children} />
