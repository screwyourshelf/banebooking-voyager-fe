<script lang="ts">
  import Button from "../primitives/Button.svelte";
  import Feedback from "./Feedback.svelte";

  type Props = {
    description?: string;
    isRetrying?: boolean;
    onRetry?: () => void;
    retryLabel?: string;
    retryingLabel?: string;
    title: string;
  };

  let {
    description,
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
  <Feedback tone="danger" {title} {description} action={retryAction} />
{:else}
  <Feedback tone="danger" {title} {description} />
{/if}
