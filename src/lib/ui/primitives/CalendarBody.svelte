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

<BitsCalendar.Header
  class="grid min-h-calendar-header grid-cols-calendar-header items-center gap-xs mb-sm"
  data-part="header"
  role="presentation"
>
  <BitsCalendar.PrevButton>
    {#snippet child({ props })}
      <button
        {...props}
        class="inline-grid w-control h-control place-items-center border-0 rounded-control bg-transparent text-ink-soft cursor-pointer outline-none enabled:hover:bg-surface-subtle enabled:hover:text-ink focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-focus-outline focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-calendar-disabled"
        data-part="month-button"
        aria-label="Forrige måned"
      >
        <svg
          class="w-control-icon h-control-icon flex-none"
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg
        >
      </button>
    {/snippet}
  </BitsCalendar.PrevButton>
  <BitsCalendar.Heading
    class="overflow-hidden font-body text-label font-calendar-heading text-center text-ellipsis capitalize whitespace-nowrap"
    data-part="heading"
  >
    {#snippet children({ headingValue })}{headingValue}{/snippet}
  </BitsCalendar.Heading>
  <BitsCalendar.NextButton>
    {#snippet child({ props })}
      <button
        {...props}
        class="inline-grid w-control h-control place-items-center border-0 rounded-control bg-transparent text-ink-soft cursor-pointer outline-none enabled:hover:bg-surface-subtle enabled:hover:text-ink focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-focus-outline focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-calendar-disabled"
        data-part="month-button"
        aria-label="Neste måned"
      >
        <svg
          class="w-control-icon h-control-icon flex-none"
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg
        >
      </button>
    {/snippet}
  </BitsCalendar.NextButton>
</BitsCalendar.Header>

{#each months as month (month.value.toString())}
  <BitsCalendar.Grid class="w-full border-collapse table-fixed" data-part="grid">
    <BitsCalendar.GridHead>
      <BitsCalendar.GridRow>
        {#each weekdays as weekday (weekday)}
          <BitsCalendar.HeadCell
            class="h-compact-control font-body text-caption font-action text-center capitalize text-ink-faint"
            data-part="weekday">{weekday}</BitsCalendar.HeadCell
          >
        {/each}
      </BitsCalendar.GridRow>
    </BitsCalendar.GridHead>
    <BitsCalendar.GridBody>
      {#each month.weeks as weekDates (weekDates[0]?.toString())}
        <BitsCalendar.GridRow>
          {#each weekDates as date (date.toString())}
            <BitsCalendar.Cell
              class="p-calendar-cell text-center compact-control:px-0"
              {date}
              month={month.value}
              data-part="cell"
            >
              <BitsCalendar.Day data-part="day">
                {#snippet child({ props, day, selected, disabled })}
                  <div
                    {...props}
                    class={[
                      "grid w-control h-control compact-control:w-calendar-day-compact place-items-center mx-auto rounded-calendar-day font-body text-body-sm tabular-nums outline-none data-[focused]:outline-3 data-[focused]:outline-solid data-[focused]:outline-focus-outline data-[focused]:outline-offset-1 data-[outside-month]:invisible",
                      selected
                        ? disabled
                          ? "bg-choice-indicator text-ink-faint font-calendar-selected cursor-not-allowed opacity-calendar-disabled"
                          : "bg-choice-indicator text-action-primary-text font-calendar-selected cursor-pointer"
                        : disabled
                          ? "text-ink-faint font-body cursor-not-allowed opacity-calendar-disabled data-[today]:bg-brand-soft data-[today]:font-calendar-selected"
                          : "text-ink-soft cursor-pointer hover:bg-surface-subtle hover:text-ink data-[today]:bg-brand-soft data-[today]:text-brand-strong data-[today]:font-calendar-selected",
                    ]}
                  >
                    {day}
                  </div>
                {/snippet}
              </BitsCalendar.Day>
            </BitsCalendar.Cell>
          {/each}
        </BitsCalendar.GridRow>
      {/each}
    </BitsCalendar.GridBody>
  </BitsCalendar.Grid>
{/each}
