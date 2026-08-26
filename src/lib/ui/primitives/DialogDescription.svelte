<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { DialogDescriptionProps } from "bits-ui";

  let { children, ...attributes }: DialogDescriptionProps = $props();
</script>

<Dialog.Description {...attributes}>{@render children?.()}</Dialog.Description>
