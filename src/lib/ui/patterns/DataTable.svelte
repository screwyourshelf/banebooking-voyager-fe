<script lang="ts" module>
  export type DataTableAlignment = "center" | "end" | "start";
  export type DataTableDirection = "down" | "up";
  export type DataTablePresentation = "detail" | "summary";
  export type DataTableVisibility = "always" | "desktop" | "mobile";

  export type DataTableColumn = {
    align?: DataTableAlignment;
    label: string;
  };

  export type DataTableCell = {
    align?: DataTableAlignment;
    direction?: DataTableDirection;
    emphasized?: boolean;
    header?: boolean;
    primary: string;
    secondary?: string;
    secondaryChange?: { direction: DataTableDirection; label: string };
    tone?: "default" | "rank";
  };

  export type DataTableRow = {
    cells: DataTableCell[];
    id: string;
  };
</script>

<script lang="ts">
  import DataTableCellView from "./DataTableCell.svelte";

  let {
    columns,
    label,
    presentation,
    rows,
    visibility = "always",
  }: {
    columns: DataTableColumn[];
    label?: string;
    presentation: DataTablePresentation;
    rows: DataTableRow[];
    visibility?: DataTableVisibility;
  } = $props();
</script>

<div
  class={[
    "overflow-x-auto border-t border-line",
    visibility === "desktop" && "hidden md:block",
    visibility === "mobile" && "md:hidden",
  ]}
  data-ui="data-table"
  data-presentation={presentation}
>
  <table class="w-full border-collapse table-fixed" aria-label={label}>
    <thead>
      <tr>
        {#each columns as column, columnIndex (`${column.label}-${columnIndex}`)}
          <th
            class={[
              "px-data-table-cell py-md bg-surface-subtle text-ink-faint text-caption font-data-table-heading",
              presentation === "detail" && "h-data-table-heading",
              column.align === "center"
                ? "text-center"
                : column.align === "end"
                  ? "text-right"
                  : "text-left",
              presentation === "summary" &&
                columns.length === 3 &&
                columnIndex === 0 &&
                "w-data-table-three-first",
              presentation === "summary" &&
                columns.length === 3 &&
                columnIndex === 1 &&
                "w-data-table-three-second",
              presentation === "summary" &&
                columns.length === 3 &&
                columnIndex === 2 &&
                "w-data-table-three-third",
              presentation === "summary" &&
                columns.length === 4 &&
                columnIndex === 0 &&
                "w-data-table-four-first",
              presentation === "summary" &&
                columns.length === 4 &&
                columnIndex === 1 &&
                "w-data-table-four-second",
              presentation === "summary" &&
                columns.length === 4 &&
                columnIndex === 2 &&
                "w-data-table-four-third",
              presentation === "summary" &&
                columns.length === 4 &&
                columnIndex === 3 &&
                "w-data-table-four-fourth",
            ]}
            scope="col">{column.label}</th
          >
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, rowIndex (row.id)}
        <tr class={rowIndex % 2 === 1 ? "bg-data-table-row-even" : ""}>
          {#each row.cells as cell, cellIndex (`${row.id}-${cellIndex}`)}
            <DataTableCellView {cell} {presentation} isLastRow={rowIndex === rows.length - 1} />
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
