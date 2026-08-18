import { Badge, type badgeVariants } from "@/components/ui/badge";
import WeatherInfo from "@/components/WeatherInfo";
import type { BookingSlotRespons, SlotStatus } from "@/types";
import { bookingSlotStyles } from "@/styles/recipes";
import type { VariantProps } from "class-variance-authority";
import type { BookingSlotPresentation } from "./bookingSlotPresentation";

type Props = {
  slot: BookingSlotRespons;
  presentation: BookingSlotPresentation;
};

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export default function BookingSlotSummary({ slot, presentation }: Props) {
  return (
    <div className={bookingSlotStyles.summary}>
      <div className={bookingSlotStyles.time}>
        <strong className={bookingSlotStyles.startTime}>{presentation.startTid}</strong>
        <span className={bookingSlotStyles.endTime}>–{presentation.sluttTid}</span>
        {slot.værSymbol || typeof slot.temperatur === "number" ? (
          <span className={bookingSlotStyles.weather}>
            <WeatherInfo
              værSymbol={slot.værSymbol}
              temperatur={slot.temperatur}
              vind={slot.vind}
              compact
            />
          </span>
        ) : null}
      </div>

      <div className={bookingSlotStyles.status}>
        <span className={bookingSlotStyles.mobileStatus}>{presentation.hovedtekst}</span>
        <Badge
          variant={getBadgeVariant(presentation.status)}
          className={`${bookingSlotStyles.desktopStatus}${
            presentation.status === "ledig" ? " bg-primary/10 text-primary" : ""
          }`}
        >
          {presentation.hovedtekst}
        </Badge>
        {presentation.sekundærtekst ? (
          <span className={bookingSlotStyles.secondary} title={presentation.sekundærtekst}>
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
