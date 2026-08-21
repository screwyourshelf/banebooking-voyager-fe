import { RecordTimeRange } from "@/components/records";
import type { LokalBooking } from "../../types";
import { Collection } from "@/components";

type Props = {
  booking: LokalBooking;
  onRediger: (id: string) => void;
};

export default function BookingRad({ booking, onRediger }: Props) {
  const erEksisterende = booking.kilde === "eksisterende";
  const erSlettet = !!booking.erSlettet;
  const erKonflikt = booking.status === "konflikt";
  const status = erSlettet
    ? { label: "Avlyses", tone: "past" as const }
    : erKonflikt
      ? { label: "Konflikt", tone: "warning" as const }
      : erEksisterende
        ? { label: "Aktiv", tone: "available" as const }
        : { label: "Forslag", tone: "event" as const };

  return (
    <Collection.Row
      layout="schedule"
      leading={<RecordTimeRange start={booking.startTid} end={booking.sluttTid} />}
      title={booking.baneNavn}
      description={erKonflikt ? booking.konfliktInfo : undefined}
      status={status}
      muted={erSlettet}
      ariaLabel={`Rediger ${booking.baneNavn}, ${booking.startTid}–${booking.sluttTid}`}
      interaction={
        erSlettet ? { type: "static" } : { type: "open", onOpen: () => onRediger(booking.id) }
      }
    />
  );
}
