<script lang="ts">
  import {
    CalendarCheckIn01Icon,
    CalendarSetting01Icon,
    UserMultiple02Icon,
  } from "@hugeicons/core-free-icons";
  import type { BookingMedlemsstatistikk } from "$lib/contracts";
  import {
    CollectionEmpty,
    DataTable,
    Icon,
    Metric,
    MetricGrid,
    Section,
    VisualizationLayout,
    type DataTableColumn,
    type DataTableRow,
  } from "$lib/ui";
  import type { Medlemsbookingtype } from "./model";
  import { formatCount, formatCountWithUnit, formatDecimal, formatHours } from "./model";

  let {
    bookingType,
    members,
  }: { bookingType: Medlemsbookingtype; members: BookingMedlemsstatistikk } = $props();

  const descriptions = $derived(
    {
      alle: {
        active: "Med minst én booking",
        ranking: "Rangert etter bookede timer i den valgte perioden.",
        empty: "Ingen brukere har bookinger med de valgte filtrene.",
      },
      vanlige: {
        active: "Med minst én vanlig booking",
        ranking: "Rangert etter bookede timer fra vanlige bookinger.",
        empty: "Ingen brukere har vanlige bookinger med de valgte filtrene.",
      },
      arrangement: {
        active: "Med minst én arrangementsbooking",
        ranking: "Rangert etter bookede timer for arrangement.",
        empty: "Ingen brukere har arrangementsbookinger med de valgte filtrene.",
      },
    }[bookingType]
  );
  const columns: DataTableColumn[] = [
    { label: "#", align: "center" },
    { label: "Bruker" },
    { label: "Timer", align: "end" },
    { label: "Bookinger", align: "end" },
  ];
  const rows = $derived<DataTableRow[]>(
    members.toppBrukere.map((user, index) => {
      const displayName = user.navn.trim() || user.epost;
      const showEmail =
        user.epost.trim().toLocaleLowerCase("nb-NO") !== displayName.toLocaleLowerCase("nb-NO");
      return {
        id: user.brukerId,
        cells: [
          { primary: String(index + 1), align: "center", tone: "rank" },
          { primary: displayName, secondary: showEmail ? user.epost : undefined, header: true },
          { primary: formatHours(user.bookedeTimer), align: "end" },
          {
            primary: formatCountWithUnit(user.antallBookinger),
            secondary:
              bookingType === "alle"
                ? `P: ${formatCountWithUnit(user.personligeBookinger)} · A: ${formatCountWithUnit(user.arrangementbookinger)}`
                : undefined,
            align: "end",
            emphasized: true,
          },
        ],
      };
    })
  );
</script>

{#snippet usersIcon()}<Icon icon={UserMultiple02Icon} />{/snippet}
{#snippet bookingsIcon()}<Icon icon={CalendarCheckIn01Icon} />{/snippet}
{#snippet hoursIcon()}<Icon icon={CalendarSetting01Icon} />{/snippet}

<VisualizationLayout variant="tab">
  <MetricGrid label="Medlemsnøkkeltall" variant="members">
    <Metric
      label="Aktive brukere"
      value={formatCount(members.aktiveBrukere)}
      unit="brukere"
      description={descriptions.active}
      icon={usersIcon}
    />
    <Metric
      label="Bookinger per bruker"
      value={`${formatDecimal(members.gjennomsnittBookingerPerBruker)} stk.`}
      description="Gjennomsnitt i perioden"
      icon={bookingsIcon}
    />
    <Metric
      label="Timer per bruker"
      value={formatHours(members.gjennomsnittBookedeTimerPerBruker)}
      description="Gjennomsnitt i perioden"
      icon={hoursIcon}
    />
  </MetricGrid>

  <Section
    variant="surface"
    padding="small"
    layout="data-table"
    title="Topp 10 brukere"
    description={descriptions.ranking}
  >
    {#if members.toppBrukere.length === 0}
      <CollectionEmpty title="Ingen aktive brukere" description={descriptions.empty} />
    {:else}
      <DataTable {columns} {rows} presentation="summary" />
    {/if}
  </Section>
</VisualizationLayout>
