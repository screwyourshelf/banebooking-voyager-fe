import { memo } from "react";
import { Collection } from "@/components";
import WeatherInfo from "@/components/WeatherInfo";
import { Stack, Text } from "@/components/layout";
import { RecordFacts, RecordTimeRange, type RecordStatusTone } from "@/components/records";
import { Button } from "@/components/ui/button";
import type { BookingSlotRespons, SlotStatus } from "@/types";
import KobleTilArrangementDialog from "./KobleTilArrangementDialog";
import { getBookingSlotPresentation } from "./bookingSlotPresentation";

type Props = {
  grenId: string;
  slot: BookingSlotRespons;
  isAuthenticated: boolean;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
};

function getStatusTone(status: SlotStatus): RecordStatusTone {
  if (status === "ledig") return "available";
  if (status === "passert") return "past";
  return "busy";
}

function BookingSlotRow({ grenId, slot, isAuthenticated, onBook, onFjern }: Props) {
  const presentation = getBookingSlotPresentation(slot, isAuthenticated);
  const isArrangement = presentation.status === "arrangement";
  const arrangementBooker = slot.arrangementTittel ? slot.booketAv?.trim() : null;
  const hasWeather = slot.værSymbol || typeof slot.temperatur === "number";
  const quickAction = presentation.kanHurtigbooke ? (
    <Button
      size="sm"
      onClick={() => onBook?.(slot)}
      aria-label={`Book tiden ${presentation.startTid} til ${presentation.sluttTid}`}
    >
      Book
    </Button>
  ) : undefined;

  const hasDetailContent = Boolean(
    slot.arrangementBeskrivelse || arrangementBooker || presentation.kanIkkeBooke
  );
  const details = hasDetailContent ? (
    <Stack gap="lg">
      {slot.arrangementBeskrivelse ? (
        <Text variant="muted">{slot.arrangementBeskrivelse}</Text>
      ) : null}

      {arrangementBooker ? (
        <RecordFacts items={[{ label: "Booket av", value: arrangementBooker }]} />
      ) : null}

      {presentation.kanIkkeBooke ? (
        <Text variant="muted">
          Du kan ikke booke denne tiden akkurat nå. Maks antall bookinger kan være nådd.
        </Text>
      ) : null}
    </Stack>
  ) : undefined;

  const actions =
    presentation.kanKobleTilArrangement || presentation.kanFjerne ? (
      <>
        {presentation.kanKobleTilArrangement ? (
          <KobleTilArrangementDialog
            grenId={grenId}
            valgtId={null}
            onVelg={(arrangementId) => {
              if (arrangementId) onBook?.(slot, arrangementId);
            }}
          >
            <Button variant="outline" size="sm">
              Koble til arrangement
            </Button>
          </KobleTilArrangementDialog>
        ) : null}

        {presentation.kanFjerne ? (
          <Button variant="destructive" size="sm" onClick={() => onFjern?.(slot)}>
            Avbestill
          </Button>
        ) : null}
      </>
    ) : undefined;
  const interaction = presentation.harDetaljer
    ? ({
        type: "expand",
        value: presentation.slotKey,
        details,
        actions,
        summaryAction: quickAction,
      } as const)
    : quickAction
      ? ({ type: "action", action: quickAction } as const)
      : ({ type: "static" } as const);

  return (
    <Collection.Row
      layout="schedule"
      muted={slot.erPassert}
      leading={
        <RecordTimeRange
          start={presentation.startTid}
          end={presentation.sluttTid}
          accessory={
            hasWeather ? (
              <WeatherInfo
                værSymbol={slot.værSymbol}
                temperatur={slot.temperatur}
                vind={slot.vind}
                compact
              />
            ) : undefined
          }
        />
      }
      title={presentation.tittel}
      category={isArrangement ? { label: "Arrangement", tone: "event" } : undefined}
      status={{ label: presentation.statusTekst, tone: getStatusTone(presentation.status) }}
      interaction={interaction}
    />
  );
}

export default memo(BookingSlotRow);
