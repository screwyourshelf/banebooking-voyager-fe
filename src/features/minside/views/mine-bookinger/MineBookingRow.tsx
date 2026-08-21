import { RecordTimeRange } from "@/components/records";
import { Collection } from "@/components";
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

export default function MineBookingRow({
  booking,
  bookingKey,
  canCancel,
  isPending,
  onCancel,
}: Props) {
  const start = booking.startTid.slice(0, 5);
  const end = booking.sluttTid.slice(0, 5);
  const hasWeather =
    !!booking.værSymbol ||
    typeof booking.temperatur === "number" ||
    typeof booking.vind === "number";
  const actions = canCancel ? (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => onCancel(booking)}
    >
      {isPending ? "Avbestiller…" : "Avbestill"}
    </Button>
  ) : undefined;

  return (
    <Collection.Row
      layout="schedule"
      muted={booking.erPassert}
      leading={
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
      }
      title={booking.baneNavn}
      description={booking.grenNavn}
      interaction={actions ? { type: "expand", value: bookingKey, actions } : { type: "static" }}
    />
  );
}
