<script lang="ts">
  import type { BookingPerBane } from "$lib/contracts";
  import {
    DataTable,
    Section,
    type DataTableColumn,
    type DataTableDirection,
    type DataTableRow,
  } from "$lib/ui";
  import { formatCountWithUnit, formatHours, formatPercentage } from "./model";

  let { courts }: { courts: BookingPerBane[] } = $props();

  const detailColumns: DataTableColumn[] = [
    { label: "Bane" },
    { label: "Gren" },
    { label: "Timer", align: "end" },
    { label: "Bookinger", align: "end" },
    { label: "Personlige", align: "end" },
    { label: "Arrangement", align: "end" },
    { label: "Året før", align: "end" },
    { label: "Endring", align: "end" },
  ];
  const summaryColumns: DataTableColumn[] = [
    { label: "Bane" },
    { label: "Timer", align: "end" },
    { label: "Bookinger", align: "end" },
  ];
  const detailRows = $derived<DataTableRow[]>(
    courts.map((court) => {
      const change = formatPercentage(court.endringBookedeTimerProsent);
      const direction = changeDirection(court.endringBookedeTimerProsent);
      return {
        id: court.baneId,
        cells: [
          { primary: court.baneNavn, header: true },
          { primary: court.grenNavn },
          { primary: formatHours(court.bookedeTimer), align: "end" },
          { primary: formatCountWithUnit(court.antallBookinger), align: "end" },
          { primary: formatCountWithUnit(court.personligeBookinger), align: "end" },
          { primary: formatCountWithUnit(court.arrangementbookinger), align: "end" },
          {
            primary:
              court.sammenligningBookedeTimer === null
                ? "—"
                : formatHours(court.sammenligningBookedeTimer),
            align: "end",
          },
          { primary: change ?? "—", align: "end", direction },
        ],
      };
    })
  );
  const summaryRows = $derived<DataTableRow[]>(
    courts.map((court) => {
      const change = formatPercentage(court.endringBookedeTimerProsent);
      const direction = changeDirection(court.endringBookedeTimerProsent);
      return {
        id: court.baneId,
        cells: [
          { primary: court.baneNavn, secondary: court.grenNavn, header: true },
          {
            primary: formatHours(court.bookedeTimer),
            secondary:
              court.sammenligningBookedeTimer === null
                ? "Ingen sammenligning"
                : `Før: ${formatHours(court.sammenligningBookedeTimer)}`,
            secondaryChange: change && direction ? { label: change, direction } : undefined,
            align: "end",
          },
          {
            primary: formatCountWithUnit(court.antallBookinger),
            secondary: `P: ${formatCountWithUnit(court.personligeBookinger)} · A: ${formatCountWithUnit(court.arrangementbookinger)}`,
            align: "end",
          },
        ],
      };
    })
  );

  function changeDirection(value: number | null): DataTableDirection | undefined {
    if (value === null) return undefined;
    return value < 0 ? "down" : "up";
  }
</script>

<Section
  variant="surface"
  padding="small"
  layout="data-table"
  title="Baner"
  description="Bookede timer og type booking for hver bane."
>
  <DataTable columns={detailColumns} rows={detailRows} presentation="detail" visibility="desktop" />
  <DataTable
    columns={summaryColumns}
    rows={summaryRows}
    presentation="summary"
    visibility="mobile"
    label="Sammenligning av baner"
  />
</Section>
