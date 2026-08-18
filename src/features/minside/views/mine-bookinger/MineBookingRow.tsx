import {
  RecordAccordionCard,
  RecordCardActions,
  RecordCardDetails,
  RecordCardSummary,
  RecordCardTrigger,
  RecordFacts,
  RecordStatus,
  RecordSummaryCopy,
  RecordTimeRange,
} from "@/components/records";
import { Button } from "@/components/ui/button";
import WeatherInfo from "@/components/WeatherInfo";
import type { MinBookingRespons } from "@/types";

type Props = {
  booking: MinBookingRespons;
  bookingKey: string;
  canCancel: boolean;
  isPending: boolean;
  onCancel: (booking: MinBookingRespons) => void;
};

function getDuration(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  return duration > 0 ? duration : duration + 24 * 60;
}

export default function MineBookingRow({
  booking,
  bookingKey,
  canCancel,
  isPending,
  onCancel,
}: Props) {
  const start = booking.startTid.slice(0, 5);
  const end = booking.sluttTid.slice(0, 5);
  const duration = getDuration(booking.startTid, booking.sluttTid);
  const hasWeather =
    !!booking.værSymbol ||
    typeof booking.temperatur === "number" ||
    typeof booking.vind === "number";

  return (
    <RecordAccordionCard value={bookingKey} muted={booking.erPassert}>
      <RecordCardTrigger>
        <RecordCardSummary layout="time">
          <RecordTimeRange
            start={start}
            end={end}
            accessory={
              hasWeather ? (
                <WeatherInfo
                  værSymbol={booking.værSymbol}
                  temperatur={booking.temperatur}
                  vind={booking.vind}
                  compact
                />
              ) : undefined
            }
          />
          <RecordSummaryCopy title={booking.baneNavn} description={booking.grenNavn} />
          <RecordStatus tone={booking.erPassert ? "past" : "own"}>
            {booking.erPassert ? "Gjennomført" : "Kommende"}
          </RecordStatus>
        </RecordCardSummary>
      </RecordCardTrigger>

      <RecordCardDetails>
        <RecordFacts
          items={[
            { label: "Varighet", value: `${duration} minutter` },
            ...(hasWeather
              ? [
                  {
                    label: "Vær",
                    value: (
                      <WeatherInfo
                        værSymbol={booking.værSymbol}
                        temperatur={booking.temperatur}
                        vind={booking.vind}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />

        {canCancel ? (
          <RecordCardActions>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => onCancel(booking)}
            >
              {isPending ? "Avbestiller…" : "Avbestill"}
            </Button>
          </RecordCardActions>
        ) : null}
      </RecordCardDetails>
    </RecordAccordionCard>
  );
}
