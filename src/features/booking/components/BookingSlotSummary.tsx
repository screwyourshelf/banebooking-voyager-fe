import { RecordCardSummary, RecordLeadingValue } from "@/components/records";
import WeatherInfo from "@/components/WeatherInfo";
import type { BookingSlotRespons } from "@/types";
import type { BookingSlotPresentation } from "./bookingSlotPresentation";

type Props = {
  slot: BookingSlotRespons;
  presentation: BookingSlotPresentation;
};

export default function BookingSlotSummary({ slot, presentation }: Props) {
  return (
    <RecordCardSummary layout="slot">
      <div className="booking-slot__time">
        <span className="booking-slot__time-start">
          <RecordLeadingValue>{presentation.startTid}</RecordLeadingValue>
        </span>
        <span className="sr-only">til {presentation.sluttTid}</span>
        {slot.værSymbol || typeof slot.temperatur === "number" ? (
          <span className="booking-slot__time-weather">
            <WeatherInfo
              værSymbol={slot.værSymbol}
              temperatur={slot.temperatur}
              vind={slot.vind}
              compact
            />
          </span>
        ) : null}
      </div>

      <div className="booking-slot__content" data-status={presentation.status}>
        <span className="booking-slot__primary-text">{presentation.hovedtekst}</span>
        {presentation.sekundærtekst ? (
          <span className="booking-slot__secondary-text" title={presentation.sekundærtekst}>
            {presentation.sekundærtekst}
          </span>
        ) : null}
      </div>
    </RecordCardSummary>
  );
}
