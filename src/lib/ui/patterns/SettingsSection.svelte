<script lang="ts" module>
  export type SettingsSectionTone = "danger" | "default";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    children?: Snippet;
    description?: string;
    embedded?: boolean;
    eyebrow: string;
    title: string;
    tone?: SettingsSectionTone;
  };

  let {
    children,
    description,
    embedded = false,
    eyebrow,
    title,
    tone = "default",
    ...attributes
  }: Props = $props();

  const headingId = $props.id();
</script>

<section
  {...attributes}
  data-ui="settings-section"
  data-embedded={embedded || undefined}
  data-tone={tone}
  aria-labelledby={headingId}
>
  <header data-part="header">
    <div data-part="intro">
      <span data-part="eyebrow">{eyebrow}</span>
      <h2 id={headingId} data-part="title">{title}</h2>
      {#if description}<p data-part="description">{description}</p>{/if}
    </div>
  </header>
  <div data-part="content">{@render children?.()}</div>
</section>
