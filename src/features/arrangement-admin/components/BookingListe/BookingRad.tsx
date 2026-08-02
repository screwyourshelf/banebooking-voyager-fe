import { AdminActionRow } from "@/components/admin";
import { Button } from "@/components/ui/button";
import type { LokalBooking } from "../../types";
import { formatDatoMedUkedag } from "./bookingListeUtils";

type Props = {
  booking: LokalBooking;
  onRediger: (id: string) => void;
  onFjernEllerAvlys: (id: string) => void;
};

export default function BookingRad({ booking, onRediger, onFjernEllerAvlys }: Props) {
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
  const description = [booking.baneNavn, erKonflikt ? booking.konfliktInfo : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <AdminActionRow
      meta={formatDatoMedUkedag(booking.dato)}
      title={`${booking.startTid}–${booking.sluttTid}`}
      description={description}
      status={status.label}
      statusTone={status.tone}
      muted={erSlettet}
      actions={
        !erSlettet ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => onRediger(booking.id)}>
              Rediger
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onFjernEllerAvlys(booking.id)}
            >
              {erEksisterende ? "Avlys" : "Fjern"}
            </Button>
          </>
        ) : undefined
      }
    />
  );
}
