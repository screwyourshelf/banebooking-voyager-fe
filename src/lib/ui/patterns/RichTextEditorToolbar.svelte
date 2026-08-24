<script lang="ts">
  import {
    Add01Icon,
    Delete02Icon,
    Heading02Icon,
    Heading03Icon,
    LeftToRightListBulletIcon,
    LeftToRightListNumberIcon,
    MinusSignIcon,
    QuoteUpIcon,
    TableIcon,
    TextBoldIcon,
    TextItalicIcon,
  } from "@hugeicons/core-free-icons";
  import Button from "../primitives/Button.svelte";
  import Icon from "../primitives/Icon.svelte";
  import type {
    RichTextEditorCommand,
    RichTextEditorController,
    RichTextEditorToggle,
  } from "../primitives/rich-text-editor-controller";

  let {
    controller,
    disabled = false,
    onCommand,
    revision,
  }: {
    controller?: RichTextEditorController;
    disabled?: boolean;
    onCommand: (command: RichTextEditorCommand) => void;
    revision: number;
  } = $props();

  function active(toggle: RichTextEditorToggle): boolean {
    revision;
    return controller?.isActive(toggle) ?? false;
  }
</script>

<div data-part="toolbar" role="toolbar" aria-label="Formatering">
  <Button
    variant={active("bold") ? "secondary" : "ghost"}
    size="compact-icon"
    data-part="control"
    aria-label="Fet"
    aria-pressed={active("bold")}
    {disabled}
    onclick={() => onCommand("bold")}
  >
    <Icon icon={TextBoldIcon} size="button" />
  </Button>
  <Button
    variant={active("italic") ? "secondary" : "ghost"}
    size="compact-icon"
    data-part="control"
    aria-label="Kursiv"
    aria-pressed={active("italic")}
    {disabled}
    onclick={() => onCommand("italic")}
  >
    <Icon icon={TextItalicIcon} size="button" />
  </Button>

  <span data-part="separator" role="separator"></span>

  <Button
    variant={active("heading-2") ? "secondary" : "ghost"}
    size="compact-icon"
    data-part="control"
    aria-label="Overskrift 2"
    aria-pressed={active("heading-2")}
    {disabled}
    onclick={() => onCommand("heading-2")}
  >
    <Icon icon={Heading02Icon} size="button" />
  </Button>
  <Button
    variant={active("heading-3") ? "secondary" : "ghost"}
    size="compact-icon"
    data-part="control"
    aria-label="Overskrift 3"
    aria-pressed={active("heading-3")}
    {disabled}
    onclick={() => onCommand("heading-3")}
  >
    <Icon icon={Heading03Icon} size="button" />
  </Button>

  <span data-part="separator" role="separator"></span>

  <Button
    variant={active("bullet-list") ? "secondary" : "ghost"}
    size="compact-icon"
    data-part="control"
    aria-label="Punktliste"
    aria-pressed={active("bullet-list")}
    {disabled}
    onclick={() => onCommand("bullet-list")}
  >
    <Icon icon={LeftToRightListBulletIcon} size="button" />
  </Button>
  <Button
    variant={active("ordered-list") ? "secondary" : "ghost"}
    size="compact-icon"
    data-part="control"
    aria-label="Nummerert liste"
    aria-pressed={active("ordered-list")}
    {disabled}
    onclick={() => onCommand("ordered-list")}
  >
    <Icon icon={LeftToRightListNumberIcon} size="button" />
  </Button>
  <Button
    variant={active("blockquote") ? "secondary" : "ghost"}
    size="compact-icon"
    data-part="control"
    aria-label="Sitat"
    aria-pressed={active("blockquote")}
    {disabled}
    onclick={() => onCommand("blockquote")}
  >
    <Icon icon={QuoteUpIcon} size="button" />
  </Button>

  <span data-part="separator" role="separator"></span>

  <Button
    variant={active("table") ? "secondary" : "ghost"}
    size="compact-icon"
    data-part="control"
    aria-label={active("table") ? "Slett tabell" : "Sett inn tabell"}
    aria-pressed={active("table")}
    {disabled}
    onclick={() => onCommand("table")}
  >
    <Icon icon={TableIcon} size="button" />
  </Button>

  {#if active("table")}
    <Button
      variant="ghost"
      size="compact-icon"
      data-part="control"
      data-tone="column"
      aria-label="Legg til kolonne"
      {disabled}
      onclick={() => onCommand("add-column")}
    >
      <Icon icon={Add01Icon} size="button" />
    </Button>
    <Button
      variant="ghost"
      size="compact-icon"
      data-part="control"
      data-tone="column"
      aria-label="Slett kolonne"
      {disabled}
      onclick={() => onCommand("delete-column")}
    >
      <Icon icon={MinusSignIcon} size="button" />
    </Button>
    <Button
      variant="ghost"
      size="compact-icon"
      data-part="control"
      data-tone="row"
      aria-label="Legg til rad"
      {disabled}
      onclick={() => onCommand("add-row")}
    >
      <Icon icon={Add01Icon} size="button" />
    </Button>
    <Button
      variant="ghost"
      size="compact-icon"
      data-part="control"
      data-tone="row"
      aria-label="Slett rad"
      {disabled}
      onclick={() => onCommand("delete-row")}
    >
      <Icon icon={MinusSignIcon} size="button" />
    </Button>
    <Button
      variant="ghost"
      size="compact-icon"
      data-part="control"
      data-tone="danger"
      aria-label="Slett tabell"
      {disabled}
      onclick={() => onCommand("delete-table")}
    >
      <Icon icon={Delete02Icon} size="button" />
    </Button>
  {/if}
</div>
