<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Switch from "../primitives/Switch.svelte";
  import SettingsRowFrame from "./SettingsRowFrame.svelte";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
    checked?: boolean;
    description?: string;
    disabled?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    pending?: boolean;
    title: string;
  };

  let {
    checked = $bindable(false),
    description,
    disabled = false,
    onCheckedChange,
    pending = false,
    title,
    ...attributes
  }: Props = $props();

  const controlDisabled = $derived(disabled || pending);

  function change(checkedValue: boolean) {
    checked = checkedValue;
    onCheckedChange?.(checkedValue);
  }
</script>

{#snippet control()}
  <Switch bind:checked aria-label={title} disabled={controlDisabled} onCheckedChange={change} />
{/snippet}

<SettingsRowFrame
  {...attributes}
  kind="switch"
  {title}
  {description}
  right={control}
  disabled={controlDisabled}
  busy={pending}
/>
