import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionDetailGrid, AccordionDetailRow, AccordionActions } from "@/components/accordion";
import { Stack, Inline } from "@/components/layout";
import WeatherInfo from "@/components/WeatherInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SlotListSkeleton from "@/components/loading/SlotListSkeleton";
import {
  User,
  Calendar,
  Timer,
  UserCheck,
  Link2,
  CalendarPlus,
  XCircle,
} from "lucide-react";
import KobleTilArrangementDialog from "./KobleTilArrangementDialog";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { grupperSlots, utledSlotVisning } from "@/utils/bookingUtils";
import type { BookingSlotRespons } from "@/types";

function formatKort(t: string) {
  const [h, m] = t.slice(0, 5).split(":");
  return m === "00" ? h : `${h}:${m}`;
}

type Props = {
  slots: BookingSlotRespons[];
  currentUser: { epost: string } | null;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onFjern?: (slot: BookingSlotRespons) => void;
  isLoading?: boolean;
};

export function BookingSlotListAccordion({
  slots,
  currentUser,
  onBook,
  onFjern,
  isLoading = false,
}: Props) {
  if (isLoading) return <SlotListSkeleton />;

  if (slots.length === 0) {
    return (
      <div className="text-muted text-sm italic py-4 text-center">
        Ingen bookinger eller slots å vise.
      </div>
    );
  }

  const synligeSlots = grupperSlots(slots);

  return (
    <Accordion type="single" collapsible className="space-y-1">
      {synligeSlots.map((slot) => {
        const slotKey = slot.bookingId ?? `${slot.dato}-${slot.slotStartTid}-${slot.baneId}`;
        const effStartTid = slot.bookingStartTid ?? slot.slotStartTid;
        const effSluttTid = slot.bookingSluttTid ?? slot.slotSluttTid;
        const tid = `${effStartTid.slice(0, 5)} – ${effSluttTid.slice(0, 5)}`;
        const tidKort = `${formatKort(effStartTid)}–${formatKort(effSluttTid)}`;

        const harArrangement = !!slot.arrangementTittel;
        const kan = (h: string) => harHandling(slot.kapabiliteter, h);
        const erBooket = !!slot.booketAv || kan(Kapabiliteter.booking.fjern);
        const erMinBooking = slot.erEier === true;

        const harHandlinger = slot.kapabiliteter.length > 0;
        const kanUtføreHandling = !!currentUser && harHandlinger;

        const harVaer =
          !!slot.værSymbol || typeof slot.temperatur === "number" || typeof slot.vind === "number";

        const erInnlogget = !!currentUser;
        const { tekst: statusTekst, variant: statusVariant } = utledSlotVisning(slot, erInnlogget);

        const [startH, startM] = effStartTid.split(":").map(Number);
        const [sluttH, sluttM] = effSluttTid.split(":").map(Number);
        const varighet = sluttH * 60 + sluttM - (startH * 60 + startM);

        return (
          <AccordionItem
            key={slotKey}
            value={slotKey}
            className={`rounded-md border bg-background px-2 last:border-b shadow-sm ${slot.erPassert ? "opacity-50" : ""}`}
          >
            <AccordionTrigger className="hover:no-underline">
              <Stack gap="xs" className="items-start">
                <Inline gap="md">
                  <span className="font-medium sm:hidden">{tidKort}</span>
                  <span className="font-medium hidden sm:inline">{tid}</span>
                  <WeatherInfo værSymbol={slot.værSymbol} iconOnly />
                  <Badge variant={statusVariant} className="text-xs">
                    {statusTekst}
                  </Badge>
                  {currentUser &&
                    !harArrangement && erMinBooking && (
                      <span
                        className="text-green-600"
                        title="Din booking"
                      >
                        <UserCheck className="size-4" />
                      </span>
                    )}
                </Inline>
                {harArrangement && slot.arrangementBeskrivelse && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {slot.arrangementBeskrivelse}
                  </span>
                )}
                {erBooket && !harArrangement && slot.booketAv && (
                  <span className="text-xs text-muted-foreground">{slot.booketAv}</span>
                )}
              </Stack>
            </AccordionTrigger>

            <AccordionContent>
              <Stack gap="sm">
                <AccordionDetailGrid>
                  <AccordionDetailRow icon={Timer} label="Varighet">
                    {varighet} min
                  </AccordionDetailRow>

                  {erBooket && (
                    <AccordionDetailRow icon={User} label="Booket av">
                      {slot.booketAv}
                    </AccordionDetailRow>
                  )}

                  {harArrangement && slot.arrangementBeskrivelse && (
                    <AccordionDetailRow icon={Calendar} label="Arrangement" colSpan={2}>
                      <span className="whitespace-pre-wrap"></span>
                    </AccordionDetailRow>
                  )}

                  {harVaer && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      {slot.værSymbol && (
                        <img
                          src={`${import.meta.env.BASE_URL}weather-symbols/svg/${slot.værSymbol}.svg`}
                          alt={slot.værSymbol}
                          width={16}
                          height={16}
                          className="select-none mt-0.5 shrink-0"
                          draggable={false}
                        />
                      )}
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">Vær</div>
                        <div className="text-sm">
                          {typeof slot.temperatur === "number" && <span>{slot.temperatur}°c</span>}
                          {typeof slot.temperatur === "number" &&
                            typeof slot.vind === "number" &&
                            " · "}
                          {typeof slot.vind === "number" && <span>{slot.vind} m/s</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionDetailGrid>

                {erInnlogget &&
                  !slot.erPassert &&
                  !erBooket &&
                  !harArrangement &&
                  !kan("booking:book") && (
                    <p className="text-xs text-muted-foreground italic">
                      Du kan ikke booke denne timen akkurat nå – maks antall bookinger kan være
                      nådd.
                    </p>
                  )}

                {/* Actions */}
                {kanUtføreHandling && (
                  <AccordionActions className="flex-wrap gap-2">
                    {kan(Kapabiliteter.booking.kobleTilArrangement) && (
                      <KobleTilArrangementDialog
                        valgtId={null}
                        onVelg={(id) => {
                          if (id) onBook?.(slot, id);
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-sm"
                        >
                          <Link2 className="h-3.5 w-3.5 shrink-0" />
                          Koble til arrangement
                        </Button>
                      </KobleTilArrangementDialog>
                    )}

                    {kan(Kapabiliteter.booking.book) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBook?.(slot);
                        }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CalendarPlus className="size-4" />
                        Book
                      </Button>
                    )}

                    {kan(Kapabiliteter.booking.fjern) && (
                      <Button
                        variant={slot.erEier ? "outline" : "destructive"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFjern?.(slot);
                        }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <XCircle className="size-4" />
                        Avbestill
                      </Button>
                    )}
                  </AccordionActions>
                )}
              </Stack>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
