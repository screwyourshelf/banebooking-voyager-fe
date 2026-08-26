<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";
  import { getOptionalAppShellContext } from "./app-shell-context";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLElement>>, "children" | "title"> & {
    actions?: Snippet;
    children?: Snippet;
    description?: string;
    eyebrow?: string;
    standalone?: boolean;
    title?: string;
  };

  let {
    actions,
    children,
    description,
    eyebrow,
    standalone = false,
    title,
    ...attributes
  }: Props = $props();

  const hasHeader = $derived(Boolean(eyebrow || title || description || actions));
  const appShell = getOptionalAppShellContext();
</script>

{#snippet content()}
  {#if hasHeader}
    <div
      class="flex flex-col gap-lg md:gap-xl lg:relative lg:gap-page-content-desktop-gap lg:px-lg lg:pt-lg lg:pb-page-content-desktop-bottom"
      data-part="content"
    >
      <header
        class="flex flex-col gap-md md:flex-row md:items-end md:justify-between md:gap-page-header-wide"
        data-part="header"
      >
        <div class="grid min-w-0 max-w-page-intro gap-page-intro md:gap-sm" data-part="intro">
          {#if eyebrow}
            <p
              class="text-accent text-caption font-page-eyebrow tracking-page-eyebrow uppercase"
              data-part="eyebrow"
            >
              {eyebrow}
            </p>
          {/if}
          {#if title}
            <h1
              class={[
                "max-w-page-title text-page-heading font-display text-page-title font-page-title tracking-page-title leading-page-title",
                appShell && "md:text-page-shell-heading lg:text-shadow-page-shell",
              ]}
              data-part="title"
            >
              {title}
            </h1>
          {/if}
          {#if description}
            <p
              class={[
                "max-w-page-description text-page-description text-body leading-page-description md:text-body-lg",
                appShell && "md:text-page-shell-description",
              ]}
              data-part="description"
            >
              {description}
            </p>
          {/if}
        </div>
        {#if actions}
          <div class="flex flex-none flex-wrap items-center gap-sm" data-part="actions">
            {@render actions()}
          </div>
        {/if}
      </header>
      {@render children?.()}
    </div>
  {:else}
    {@render children?.()}
  {/if}
{/snippet}

{#if standalone}
  <main
    {...attributes}
    class="w-full min-w-0 max-w-page mx-auto p-page md:px-page-wide-inline md:pt-page-wide-top md:pb-page-wide-bottom lg:animate-page-shell-enter lg:pt-page-desktop-top lg:pr-page-desktop-inline-end lg:pb-page-desktop-bottom lg:pl-page-desktop-inline-start lg:motion-reduce:animate-none"
    data-ui="page"
  >
    {@render content()}
  </main>
{:else}
  <div
    {...attributes}
    class="w-full min-w-0 max-w-page mx-auto p-page md:px-page-wide-inline md:pt-page-wide-top md:pb-page-wide-bottom lg:animate-page-shell-enter lg:pt-page-desktop-top lg:pr-page-desktop-inline-end lg:pb-page-desktop-bottom lg:pl-page-desktop-inline-start lg:motion-reduce:animate-none"
    data-ui="page"
  >
    {@render content()}
  </div>
{/if}
