<script lang="ts">
  import type { BaneRespons, BookingstatistikkFiltre, GrenRespons } from "$lib/contracts";
  import { CollectionControls, type CollectionControlField } from "$lib/ui";
  import {
    MEMBER_BOOKING_TYPE_OPTIONS,
    STATISTICS_PERIOD_OPTIONS,
    type Medlemsbookingtype,
    type StatistikkPeriodevalg,
  } from "./model";

  let {
    activities,
    bookingType,
    courts,
    disabled = false,
    filters,
    onActivityChange,
    onBookingTypeChange,
    onCourtChange,
    onFiltersChange,
    onPeriodChange,
    period,
    showBookingType = false,
  }: {
    activities: readonly GrenRespons[];
    bookingType: Medlemsbookingtype;
    courts: readonly BaneRespons[];
    disabled?: boolean;
    filters: BookingstatistikkFiltre;
    onActivityChange: (value: string | null) => void;
    onBookingTypeChange: (value: Medlemsbookingtype) => void;
    onCourtChange: (value: string | null) => void;
    onFiltersChange: (filters: BookingstatistikkFiltre) => void;
    onPeriodChange: (value: StatistikkPeriodevalg) => void;
    period: StatistikkPeriodevalg;
    showBookingType?: boolean;
  } = $props();

  const groups = $derived([
    ...(showBookingType
      ? [
          {
            label: "Bookingtype",
            options: MEMBER_BOOKING_TYPE_OPTIONS,
            selectedValues: [bookingType],
            onSelect: (value: string) => onBookingTypeChange(value as Medlemsbookingtype),
          },
        ]
      : []),
    {
      label: "Gren",
      options: [
        { value: "alle", label: "Alle grener" },
        ...activities.map((activity) => ({
          value: activity.id,
          label: `${activity.navn}${activity.aktiv ? "" : " (inaktiv)"}`,
        })),
      ],
      selectedValues: [filters.grenId ?? "alle"],
      onSelect: (value: string) => onActivityChange(value === "alle" ? null : value),
    },
    ...(filters.grenId
      ? [
          {
            label: "Bane",
            options: [
              { value: "alle", label: "Alle baner" },
              ...courts.map((court) => ({
                value: court.id,
                label: `${court.navn}${court.aktiv ? "" : " (inaktiv)"}`,
              })),
            ],
            selectedValues: [filters.baneId ?? "alle"],
            onSelect: (value: string) => onCourtChange(value === "alle" ? null : value),
          },
        ]
      : []),
  ]);

  const fields = $derived.by(() => {
    const result: CollectionControlField[] = [
      {
        id: "period",
        label: "Periode",
        type: "select",
        value: period,
        options: STATISTICS_PERIOD_OPTIONS,
        onValueChange: (value) => onPeriodChange(value as StatistikkPeriodevalg),
      },
      {
        id: "comparison",
        type: "switch",
        title: "Sammenlign med året før",
        description: "Bruker samme datoer ett år tidligere",
        checked: filters.sammenlignMedForrigeÅr,
        onCheckedChange: (checked) =>
          onFiltersChange({ ...filters, sammenlignMedForrigeÅr: checked }),
        width: "wide",
      },
    ];

    if (period === "egendefinert") {
      result.push(
        {
          id: "from",
          label: "Fra",
          type: "date",
          value: filters.fra,
          onValueChange: (fra) =>
            onFiltersChange({ ...filters, fra, til: filters.til < fra ? fra : filters.til }),
        },
        {
          id: "until",
          label: "Til",
          type: "date",
          value: filters.til,
          min: filters.fra,
          onValueChange: (til) => onFiltersChange({ ...filters, til }),
        }
      );
    }

    return result;
  });
</script>

<CollectionControls label="Statistikkvalg" mode="selection" {groups} {fields} {disabled} />
