<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { DialogTitleProps } from "bits-ui";

  let { children, level = 2, ...attributes }: DialogTitleProps = $props();
</script>

<Dialog.Title {...attributes} {level}>{@render children?.()}</Dialog.Title>
