<script lang="ts">
  import type { BookingPerBane } from "$lib/contracts";
  import { Section } from "$lib/ui";
  import { formatCountWithUnit, formatHours, formatPercentage } from "./model";

  let { courts }: { courts: BookingPerBane[] } = $props();
</script>

<Section
  variant="surface"
  padding="small"
  title="Baner"
  description="Bookede timer og type booking for hver bane."
  data-context="statistics"
  data-view="court-table"
>
  <div data-slot="table-container">
    <table>
      <thead>
        <tr>
          <th data-slot="table-head" scope="col">Bane</th>
          <th data-slot="table-head" scope="col">Gren</th>
          <th data-slot="table-head" scope="col" class="statistics-table__numeric">Timer</th>
          <th data-slot="table-head" scope="col" class="statistics-table__numeric">Bookinger</th>
          <th data-slot="table-head" scope="col" class="statistics-table__numeric">Personlige</th>
          <th data-slot="table-head" scope="col" class="statistics-table__numeric">Arrangement</th>
          <th data-slot="table-head" scope="col" class="statistics-table__numeric">Året før</th>
          <th data-slot="table-head" scope="col" class="statistics-table__numeric">Endring</th>
        </tr>
      </thead>
      <tbody>
        {#each courts as court (court.baneId)}
          {@const change = formatPercentage(court.endringBookedeTimerProsent)}
          {@const direction =
            court.endringBookedeTimerProsent === null
              ? undefined
              : court.endringBookedeTimerProsent < 0
                ? "down"
                : "up"}
          <tr>
            <th data-slot="table-cell" scope="row" class="statistics-court-table__name">
              {court.baneNavn}
            </th>
            <td data-slot="table-cell">{court.grenNavn}</td>
            <td data-slot="table-cell" class="statistics-table__numeric">
              {formatHours(court.bookedeTimer)}
            </td>
            <td data-slot="table-cell" class="statistics-table__numeric">
              {formatCountWithUnit(court.antallBookinger)}
            </td>
            <td data-slot="table-cell" class="statistics-table__numeric">
              {formatCountWithUnit(court.personligeBookinger)}
            </td>
            <td data-slot="table-cell" class="statistics-table__numeric">
              {formatCountWithUnit(court.arrangementbookinger)}
            </td>
            <td data-slot="table-cell" class="statistics-table__numeric">
              {court.sammenligningBookedeTimer === null
                ? "—"
                : formatHours(court.sammenligningBookedeTimer)}
            </td>
            <td
              data-slot="table-cell"
              class="statistics-table__numeric"
              data-value="change"
              data-direction={direction}
            >
              {change ?? "—"}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="statistics-comparison-table" data-layout="courts">
    <table aria-label="Sammenligning av baner">
      <thead>
        <tr>
          <th scope="col">Bane</th>
          <th scope="col" data-align="end">Timer</th>
          <th scope="col" data-align="end">Bookinger</th>
        </tr>
      </thead>
      <tbody>
        {#each courts as court (court.baneId)}
          {@const change = formatPercentage(court.endringBookedeTimerProsent)}
          {@const direction =
            court.endringBookedeTimerProsent === null
              ? undefined
              : court.endringBookedeTimerProsent < 0
                ? "down"
                : "up"}
          <tr>
            <th scope="row">
              <strong>{court.baneNavn}</strong>
              <small>{court.grenNavn}</small>
            </th>
            <td data-align="end">
              <strong>{formatHours(court.bookedeTimer)}</strong>
              <small>
                {court.sammenligningBookedeTimer === null
                  ? "Ingen sammenligning"
                  : `Før: ${formatHours(court.sammenligningBookedeTimer)}`}
                {#if change}<span data-direction={direction}> · {change}</span>{/if}
              </small>
            </td>
            <td data-align="end">
              <strong>{formatCountWithUnit(court.antallBookinger)}</strong>
              <small>
                P: {formatCountWithUnit(court.personligeBookinger)} · A:
                {formatCountWithUnit(court.arrangementbookinger)}
              </small>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Section>
