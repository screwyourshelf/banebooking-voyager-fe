import WeatherInfo from "@/components/WeatherInfo";
import {
  RecordCardSummary,
  RecordStatus,
  RecordSummaryCopy,
  RecordTimeRange,
  type RecordStatusTone,
} from "@/components/records";
import type { BookingSlotRespons, SlotStatus } from "@/types";
import type { BookingSlotPresentation } from "./bookingSlotPresentation";

type Props = {
  slot: BookingSlotRespons;
  presentation: BookingSlotPresentation;
};

export default function BookingSlotSummary({ slot, presentation }: Props) {
  return (
    <RecordCardSummary layout="slot">
      <RecordTimeRange
        start={presentation.startTid}
        end={presentation.sluttTid}
        accessory={
          slot.værSymbol || typeof slot.temperatur === "number" ? (
            <WeatherInfo
              værSymbol={slot.værSymbol}
              temperatur={slot.temperatur}
              vind={slot.vind}
              compact
            />
          ) : undefined
        }
      />
      <RecordSummaryCopy
        title={
          <RecordStatus tone={getStatusTone(presentation.status)} align="text-start">
            {presentation.hovedtekst}
          </RecordStatus>
        }
        description={presentation.sekundærtekst}
      />
    </RecordCardSummary>
  );
}

function getStatusTone(status: SlotStatus): RecordStatusTone {
  if (status === "ledig") return "available";
  if (status === "din_booking") return "own";
  if (status === "arrangement") return "event";
  if (status === "passert") return "past";
  return "busy";
}
