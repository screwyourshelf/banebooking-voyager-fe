<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "../primitives/Button.svelte";
  import CollectionState from "./CollectionState.svelte";

  type Props = {
    description?: string;
    icon?: Snippet;
    isRetrying?: boolean;
    onRetry?: () => void;
    retryLabel?: string;
    retryingLabel?: string;
    title: string;
  };

  let {
    description,
    icon,
    isRetrying = false,
    onRetry,
    retryLabel = "Prøv igjen",
    retryingLabel = "Prøver igjen …",
    title,
  }: Props = $props();
</script>

{#if onRetry}
  {#snippet retryAction()}
    <Button variant="secondary" disabled={isRetrying} onclick={onRetry}>
      {isRetrying ? retryingLabel : retryLabel}
    </Button>
  {/snippet}
  <CollectionState tone="danger" {title} {description} {icon} action={retryAction} />
{:else}
  <CollectionState tone="danger" {title} {description} {icon} />
{/if}
