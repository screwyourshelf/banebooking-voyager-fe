import { Timer, Wind } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
    <AccordionItem value={bookingKey}>
      <AccordionTrigger className="px-4 py-4 hover:no-underline md:px-5">
        <span className="grid min-w-0 flex-1 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 md:grid-cols-[10rem_minmax(0,1fr)_auto]">
          <span className="flex min-w-0 items-center gap-3">
            <span className="whitespace-nowrap">
              <strong className="text-base font-semibold">{start}</strong>
              <span className="ml-1 text-muted-foreground">–{end}</span>
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

          <span className="col-start-1 row-start-2 grid min-w-0 text-left md:col-start-2 md:row-start-1">
            <span className="truncate font-medium">{booking.baneNavn}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {booking.grenNavn}
            </span>
          </span>

          <Badge
            variant={booking.erPassert ? "outline" : "default"}
            className="col-start-2 row-start-2 md:col-start-3 md:row-start-1"
          >
            {booking.erPassert ? "Gjennomført" : "Kommende"}
          </Badge>
        </span>
      </AccordionTrigger>

      <AccordionContent>
        <div className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Timer aria-hidden="true" className="size-4" />
                Varighet
              </dt>
              <dd className="font-medium">{duration} minutter</dd>
            </div>

            {hasWeather ? (
              <div className="space-y-1">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Wind aria-hidden="true" className="size-4" />
                  Vær
                </dt>
                <dd className="font-medium">
                  <WeatherInfo
                    værSymbol={booking.værSymbol}
                    temperatur={booking.temperatur}
                    vind={booking.vind}
                  />
                </dd>
              </div>
            ) : null}
          </dl>

          {canCancel ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => onCancel(booking)}
            >
              {isPending ? "Avbestiller…" : "Avbestill"}
            </Button>
          ) : null}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
