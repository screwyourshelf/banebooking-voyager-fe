<script lang="ts">
  import { Calendar as BitsCalendar, type Month } from "bits-ui";
  import type { DateValue } from "@internationalized/date";

  let {
    months,
    weekdays,
  }: {
    months: Month<DateValue>[];
    weekdays: string[];
  } = $props();
</script>

<BitsCalendar.Header data-part="header" role="presentation">
  <BitsCalendar.PrevButton>
    {#snippet child({ props })}
      <button {...props} data-part="month-button" aria-label="Forrige måned">
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg>
      </button>
    {/snippet}
  </BitsCalendar.PrevButton>
  <BitsCalendar.Heading data-part="heading">
    {#snippet children({ headingValue })}{headingValue}{/snippet}
  </BitsCalendar.Heading>
  <BitsCalendar.NextButton>
    {#snippet child({ props })}
      <button {...props} data-part="month-button" aria-label="Neste måned">
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg>
      </button>
    {/snippet}
  </BitsCalendar.NextButton>
</BitsCalendar.Header>

{#each months as month (month.value.toString())}
  <BitsCalendar.Grid data-part="grid">
    <BitsCalendar.GridHead>
      <BitsCalendar.GridRow>
        {#each weekdays as weekday (weekday)}
          <BitsCalendar.HeadCell data-part="weekday">{weekday}</BitsCalendar.HeadCell>
        {/each}
      </BitsCalendar.GridRow>
    </BitsCalendar.GridHead>
    <BitsCalendar.GridBody>
      {#each month.weeks as weekDates (weekDates[0]?.toString())}
        <BitsCalendar.GridRow>
          {#each weekDates as date (date.toString())}
            <BitsCalendar.Cell {date} month={month.value} data-part="cell">
              <BitsCalendar.Day data-part="day">
                {#snippet children({ day })}{day}{/snippet}
              </BitsCalendar.Day>
            </BitsCalendar.Cell>
          {/each}
        </BitsCalendar.GridRow>
      {/each}
    </BitsCalendar.GridBody>
  </BitsCalendar.Grid>
{/each}
