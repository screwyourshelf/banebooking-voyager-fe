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
  class={[
    "overflow-hidden bg-surface-raised",
    embedded
      ? "border-0 rounded-none shadow-none md:rounded-none"
      : "border rounded-settings-section shadow-surface-md md:rounded-settings-section-wide",
    tone === "danger" ? "border-settings-danger-border" : "border-line",
    tone === "danger" &&
      "settings-danger-actions:border-t-settings-danger-actions-border settings-danger-actions:bg-settings-danger-actions-surface",
  ]}
  data-ui="settings-section"
  data-embedded={embedded || undefined}
  data-tone={tone}
  aria-labelledby={headingId}
>
  <header
    class={[
      "flex items-start gap-md border-b p-settings-section-header md:px-settings-header-wide md:py-lg",
      tone === "danger"
        ? "border-settings-danger-header-border bg-settings-danger-header-surface"
        : "border-line bg-settings-header-surface",
    ]}
    data-part="header"
  >
    <div class="flex min-w-0 flex-col" data-part="intro">
      <span
        class={[
          "mb-settings-section-eyebrow text-label font-settings-eyebrow tracking-settings-eyebrow leading-settings-eyebrow uppercase",
          tone === "danger" ? "text-status-danger-text" : "text-choice-indicator",
        ]}
        data-part="eyebrow"
      >
        {eyebrow}
      </span>
      <h2
        class={[
          "text-body font-settings-title md:text-body-lg",
          tone === "danger" ? "text-status-danger-text" : "text-ink",
        ]}
        id={headingId}
        data-part="title"
      >
        {title}
      </h2>
      {#if description}
        <p
          class="max-w-settings-description mt-settings-section-description text-ink-faint text-caption leading-settings-description"
          data-part="description"
        >
          {description}
        </p>
      {/if}
    </div>
  </header>
  <div class="bg-surface" data-part="content">{@render children?.()}</div>
</section>
