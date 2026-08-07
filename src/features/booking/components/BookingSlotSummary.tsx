import { Badge, type badgeVariants } from "@/components/ui/badge";
import WeatherInfo from "@/components/WeatherInfo";
import type { BookingSlotRespons, SlotStatus } from "@/types";
import type { VariantProps } from "class-variance-authority";
import type { BookingSlotPresentation } from "./bookingSlotPresentation";

type Props = {
  slot: BookingSlotRespons;
  presentation: BookingSlotPresentation;
};

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export default function BookingSlotSummary({ slot, presentation }: Props) {
  return (
    <div className="grid min-w-0 gap-2 text-left sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center sm:gap-5">
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 tabular-nums">
        <strong className="text-base">{presentation.startTid}</strong>
        <span className="text-sm text-muted-foreground">–{presentation.sluttTid}</span>
        {slot.værSymbol || typeof slot.temperatur === "number" ? (
          <span className="basis-full">
            <WeatherInfo
              værSymbol={slot.værSymbol}
              temperatur={slot.temperatur}
              vind={slot.vind}
              compact
            />
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Badge variant={getBadgeVariant(presentation.status)}>{presentation.hovedtekst}</Badge>
        {presentation.sekundærtekst ? (
          <span
            className="min-w-0 truncate text-sm text-muted-foreground"
            title={presentation.sekundærtekst}
          >
            {presentation.sekundærtekst}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function getBadgeVariant(status: SlotStatus): BadgeVariant {
  if (status === "ledig") return "secondary";
  if (status === "arrangement" || status === "din_booking") return "default";
  if (status === "passert") return "ghost";
  return "outline";
}
