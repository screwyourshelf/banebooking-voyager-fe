import { Timer, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RecordAccordionCard,
  RecordCard,
  RecordCardActions,
  RecordCardDetails,
  RecordCardStatic,
  RecordCardSummary,
  RecordCardTrigger,
  RecordStatus,
  RecordTimeRange,
} from "@/components/records";
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

  const summary = (
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
          ) : null
        }
      />

      <span className="mine-booking__identity">
        <span className="mine-booking__court">{booking.baneNavn}</span>
        <span className="mine-booking__branch">{booking.grenNavn}</span>
      </span>

      <RecordStatus tone={booking.erPassert ? "past" : "own"}>
        {booking.erPassert ? "Gjennomført" : "Kommende"}
      </RecordStatus>
    </RecordCardSummary>
  );

  if (!canCancel) {
    return (
      <RecordCard>
        <RecordCardStatic>{summary}</RecordCardStatic>
      </RecordCard>
    );
  }

  return (
    <RecordAccordionCard value={bookingKey}>
      <RecordCardTrigger>{summary}</RecordCardTrigger>

      <RecordCardDetails>
        <div className="mine-booking__detail-content">
          <dl className="mine-booking__facts">
            <div>
              <dt>
                <Timer aria-hidden="true" />
                Varighet
              </dt>
              <dd>{duration} minutter</dd>
            </div>

            {hasWeather ? (
              <div>
                <dt>
                  <Wind aria-hidden="true" />
                  Vær
                </dt>
                <dd>
                  <WeatherInfo
                    værSymbol={booking.værSymbol}
                    temperatur={booking.temperatur}
                    vind={booking.vind}
                  />
                </dd>
              </div>
            ) : null}
          </dl>

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
        </div>
      </RecordCardDetails>
    </RecordAccordionCard>
  );
}
