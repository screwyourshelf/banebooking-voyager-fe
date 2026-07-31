import { Timer, Wind } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RecordStatus } from "@/components/records";
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
    <div className="record-card__summary mine-booking__summary">
      <span className="mine-booking__time">
        <span className="mine-booking__time-range">
          <strong>{start}</strong>
          <span>–{end}</span>
        </span>

        {hasWeather ? (
          <WeatherInfo
            værSymbol={booking.værSymbol}
            temperatur={booking.temperatur}
            vind={booking.vind}
            compact
          />
        ) : null}
      </span>

      <span className="mine-booking__identity">
        <span className="mine-booking__court">{booking.baneNavn}</span>
      </span>

      <RecordStatus tone={booking.erPassert ? "past" : "own"}>
        {booking.erPassert ? "Gjennomført" : "Kommende"}
      </RecordStatus>
    </div>
  );

  if (!canCancel) {
    return (
      <div className="record-card record-card-row mine-booking" data-past={booking.erPassert}>
        <div className="record-card__static mine-booking__static">{summary}</div>
      </div>
    );
  }

  return (
    <AccordionItem
      value={bookingKey}
      className="record-card record-card-row mine-booking"
      data-past={booking.erPassert}
    >
      <AccordionTrigger className="record-card__trigger mine-booking__trigger hover:no-underline">
        {summary}
      </AccordionTrigger>

      <AccordionContent className="record-card__details mine-booking__details">
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

          <div className="record-card__actions mine-booking__actions">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => onCancel(booking)}
            >
              {isPending ? "Avbestiller…" : "Avbestill"}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
