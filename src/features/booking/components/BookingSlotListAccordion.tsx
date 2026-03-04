import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionDetailGrid, AccordionDetailRow, AccordionActions } from "@/components/accordion";
import WeatherInfo from "@/components/WeatherInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SlotListSkeleton from "@/components/loading/SlotListSkeleton";
import {
  User,
  Calendar,
  Timer,
  Users,
  UserCheck,
  Link2,
  CalendarPlus,
  XCircle,
  Trash2,
} from "lucide-react";
import PaameldteDialog from "@/features/arrangementer/views/arrangementer/PaameldteDialog";
import KobleTilArrangementDialog from "./KobleTilArrangementDialog";
import { harHandling } from "@/utils/handlingUtils";
import { grupperSlots, utledSlotVisning } from "@/utils/bookingUtils";
import { formatDatoKort } from "@/utils/datoUtils";
import type { BookingSlotRespons } from "@/types";

type Props = {
  slots: BookingSlotRespons[];
  currentUser: { epost: string } | null;
  onBook?: (slot: BookingSlotRespons, arrangementId?: string) => void;
  onCancel?: (slot: BookingSlotRespons) => void;
  onDelete?: (slot: BookingSlotRespons) => void;
  onMeldPaa?: (slot: BookingSlotRespons) => void;
  onMeldAv?: (slot: BookingSlotRespons) => void;
  isLoading?: boolean;
};

export function BookingSlotListAccordion({
  slots,
  currentUser,
  onBook,
  onCancel,
  onDelete,
  onMeldPaa,
  onMeldAv,
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
        const slotKey = slot.bookingId ?? `${slot.dato}-${slot.startTid}-${slot.baneId}`;
        const effStartTid = slot.bookingStartTid ?? slot.startTid;
        const effSluttTid = slot.bookingSluttTid ?? slot.sluttTid;
        const tid = `${effStartTid.slice(0, 5)} – ${effSluttTid.slice(0, 5)}`;
        const formatKort = (t: string) => {
          const [h, m] = t.slice(0, 5).split(":");
          return m === "00" ? h : `${h}:${m}`;
        };
        const tidKort = `${formatKort(effStartTid)}–${formatKort(effSluttTid)}`;

        const harArrangement = !!slot.arrangementTittel;
        const kan = (h: string) => harHandling(slot.tillattHandlinger, h);
        const erBooket = !!slot.booketAv || kan("booking:slett") || kan("booking:avbestill");
        const erMinBooking = slot.erEier === true;

        const harHandlinger = slot.tillattHandlinger.length > 0;
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
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium sm:hidden">{tidKort}</span>
                  <span className="font-medium hidden sm:inline">{tid}</span>
                  <WeatherInfo værSymbol={slot.værSymbol} iconOnly />
                  <Badge variant={statusVariant} className="text-xs">
                    {statusTekst}
                  </Badge>
                  {currentUser &&
                    ((!harArrangement && erMinBooking) ||
                      (harArrangement && slot.tillaterPaamelding && slot.erPaameldt)) && (
                      <span
                        className="text-green-600"
                        title={erMinBooking ? "Din booking" : "Du er påmeldt"}
                      >
                        <UserCheck className="size-4" />
                      </span>
                    )}
                </div>
                {harArrangement && slot.arrangementBeskrivelse && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {slot.arrangementBeskrivelse}
                  </span>
                )}
                {erBooket && !harArrangement && slot.booketAv && (
                  <span className="text-xs text-muted-foreground">{slot.booketAv}</span>
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-3">
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

                  {harArrangement && slot.tillaterPaamelding && slot.arrangementId && (
                    <AccordionDetailRow
                      icon={Users}
                      label="Påmeldte"
                      iconClassName={currentUser && slot.erPaameldt ? "text-green-600" : undefined}
                    >
                      {currentUser ? (
                        <PaameldteDialog
                          arrangementId={slot.arrangementId}
                          tittel={slot.arrangementTittel ?? "Arrangement"}
                        >
                          <button
                            type="button"
                            className="underline underline-offset-2 hover:text-foreground transition-colors"
                          >
                            {slot.antallPaameldte ?? 0} påmeldt
                          </button>
                        </PaameldteDialog>
                      ) : (
                        <span className="text-sm">{slot.antallPaameldte ?? 0} påmeldt</span>
                      )}
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
                    {kan("booking:kobleTilArrangement") && (
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

                    {kan("booking:book") && (
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

                    {kan("booking:avbestill") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancel?.(slot);
                        }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <XCircle className="size-4" />
                        Avbestill
                      </Button>
                    )}

                    {kan("booking:slett") && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(slot);
                        }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Trash2 className="size-4" />
                        Slett
                      </Button>
                    )}

                    {kan("booking:meldAv") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMeldAv?.(slot);
                        }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <XCircle className="size-4" />
                        Meld meg av
                      </Button>
                    )}

                    {kan("booking:meldPaa") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMeldPaa?.(slot);
                        }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CalendarPlus className="size-4" />
                        Meld meg på
                      </Button>
                    )}
                  </AccordionActions>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
