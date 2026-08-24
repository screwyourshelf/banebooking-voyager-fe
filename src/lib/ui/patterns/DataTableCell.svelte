<script lang="ts">
  import type { DataTableCell, DataTablePresentation } from "./DataTable.svelte";

  let {
    cell,
    isLastRow,
    presentation,
  }: { cell: DataTableCell; isLastRow: boolean; presentation: DataTablePresentation } = $props();
</script>

{#if cell.header}
  <th
    class={[
      "min-w-0 px-data-table-cell py-md align-top",
      !isLastRow && "border-b border-line",
      cell.align === "center" ? "text-center" : cell.align === "end" ? "text-right" : "text-left",
      presentation === "detail"
        ? "text-ink text-body-sm font-data-table-row-heading tabular-nums"
        : "text-ink-soft text-body-sm",
      cell.tone === "rank" && "text-ink-faint font-data-table-heading",
      cell.direction === "up" && "text-status-available-text font-data-table-heading",
      cell.direction === "down" && "text-status-danger-text font-data-table-heading",
    ]}
    scope="row"
  >
    {#if presentation === "summary"}
      <strong
        class="block overflow-hidden text-ink font-data-table-heading text-ellipsis whitespace-nowrap"
        >{cell.primary}</strong
      >
      {#if cell.secondary}
        <small
          class="block overflow-hidden mt-data-table-detail text-ink-faint text-micro font-data-table-detail leading-data-table-detail text-ellipsis whitespace-nowrap"
          >{cell.secondary}</small
        >
      {/if}
    {:else}
      {cell.primary}
    {/if}
  </th>
{:else}
  <td
    class={[
      "min-w-0 px-data-table-cell py-md align-top",
      !isLastRow && "border-b border-line",
      cell.align === "center" ? "text-center" : cell.align === "end" ? "text-right" : "text-left",
      presentation === "detail"
        ? "text-ink-soft text-body-sm tabular-nums"
        : "text-ink-soft text-body-sm",
      cell.tone === "rank" && "text-ink-faint font-data-table-heading",
      cell.direction === "up" && "text-status-available-text font-data-table-heading",
      cell.direction === "down" && "text-status-danger-text font-data-table-heading",
    ]}
  >
    {#if presentation === "summary" && (cell.emphasized || cell.secondary)}
      <strong class="block text-ink font-data-table-heading whitespace-nowrap"
        >{cell.primary}</strong
      >
      {#if cell.secondary}
        <small
          class="block overflow-hidden mt-data-table-detail text-ink-faint text-micro font-data-table-detail leading-data-table-detail text-ellipsis whitespace-nowrap"
        >
          {cell.secondary}{#if cell.secondaryChange}<span
              class={[
                "font-data-table-heading",
                cell.secondaryChange.direction === "down"
                  ? "text-status-danger-text"
                  : "text-status-available-text",
              ]}
            >
              · {cell.secondaryChange.label}</span
            >{/if}
        </small>
      {/if}
    {:else}
      {cell.primary}
    {/if}
  </td>
{/if}
