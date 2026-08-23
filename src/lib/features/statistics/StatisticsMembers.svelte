<script lang="ts">
  import {
    CalendarCheckIn01Icon,
    CalendarSetting01Icon,
    UserMultiple02Icon,
  } from "@hugeicons/core-free-icons";
  import type { BookingMedlemsstatistikk } from "$lib/contracts";
  import { CollectionEmpty, Icon, Metric, MetricGrid, Section } from "$lib/ui";
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
</script>

{#snippet usersIcon()}<Icon icon={UserMultiple02Icon} />{/snippet}
{#snippet bookingsIcon()}<Icon icon={CalendarCheckIn01Icon} />{/snippet}
{#snippet hoursIcon()}<Icon icon={CalendarSetting01Icon} />{/snippet}

<div class="statistics-dashboard__tab-content">
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
    title="Topp 10 brukere"
    description={descriptions.ranking}
    data-context="statistics"
    data-view="top-users"
  >
    {#if members.toppBrukere.length === 0}
      <CollectionEmpty title="Ingen aktive brukere" description={descriptions.empty} />
    {:else}
      <div class="statistics-comparison-table" data-layout="users">
        <table>
          <thead>
            <tr>
              <th scope="col" data-align="center">#</th>
              <th scope="col">Bruker</th>
              <th scope="col" data-align="end">Timer</th>
              <th scope="col" data-align="end">Bookinger</th>
            </tr>
          </thead>
          <tbody>
            {#each members.toppBrukere as user, index (user.brukerId)}
              {@const displayName = user.navn.trim() || user.epost}
              {@const showEmail =
                user.epost.trim().toLocaleLowerCase("nb-NO") !==
                displayName.toLocaleLowerCase("nb-NO")}
              <tr>
                <td data-align="center">{index + 1}</td>
                <th scope="row">
                  <strong>{displayName}</strong>
                  {#if showEmail}<small>{user.epost}</small>{/if}
                </th>
                <td data-align="end">{formatHours(user.bookedeTimer)}</td>
                <td data-align="end">
                  <strong>{formatCountWithUnit(user.antallBookinger)}</strong>
                  {#if bookingType === "alle"}
                    <small>
                      P: {formatCountWithUnit(user.personligeBookinger)} · A:
                      {formatCountWithUnit(user.arrangementbookinger)}
                    </small>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Section>
</div>
