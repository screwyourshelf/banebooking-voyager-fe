import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionDetailGrid, AccordionDetailRow } from "@/components/accordion";
import WeatherInfo from "@/components/WeatherInfo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SlotListSkeleton from "@/components/loading/SlotListSkeleton";
import { User, Calendar, Timer, Users, UserCheck, Link2, CalendarPlus, XCircle, Trash2 } from "lucide-react";
import PaameldteDialog from "@/features/minside/views/kommende-arrangementer/PaameldteDialog";
import KobleTilArrangementDialog from "./KobleTilArrangementDialog";
import { harHandling } from "@/utils/handlingUtils";
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

  return (
    <Accordion type="single" collapsible className="space-y-1">
      {slots.map((slot) => {
        const slotKey = `${slot.dato}-${slot.startTid}-${slot.baneId}`;
        const tid = `${slot.startTid.slice(0, 5)} – ${slot.sluttTid.slice(0, 5)}`;
        const formatKort = (t: string) => {
          const [h, m] = t.slice(0, 5).split(":");
          return m === "00" ? h : `${h}:${m}`;
        };
        const tidKort = `${formatKort(slot.startTid)}–${formatKort(slot.sluttTid)}`;

        const harArrangement = !!slot.arrangementTittel;
        const erBooket = !!slot.booketAv;
        const erMinBooking = slot.erEier === true;

        const kan = (h: string) => harHandling(slot.tillattHandlinger, h);
        const harHandlinger = slot.tillattHandlinger.length > 0;
        const kanUtføreHandling = !!currentUser && harHandlinger;

        const harVaer =
          !!slot.værSymbol || typeof slot.temperatur === "number" || typeof slot.vind === "number";

        let statusTekst = "Ledig";
        let statusVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";

        if (slot.erPassert) {
          statusTekst = "Passert";
          statusVariant = "outline";
        } else if (harArrangement) {
          statusTekst = slot.arrangementTittel ?? "Arrangement";
          statusVariant = "default";
        } else if (currentUser && erMinBooking) {
          statusTekst = "Din booking";
          statusVariant = "default";
        } else if (erBooket) {
          statusTekst = "Opptatt";
          statusVariant = "outline";
        }

        const [startH, startM] = slot.startTid.split(":").map(Number);
        const [sluttH, sluttM] = slot.sluttTid.split(":").map(Number);
        const varighet = sluttH * 60 + sluttM - (startH * 60 + startM);

        return (
          <AccordionItem
            key={slotKey}
            value={slotKey}
            className={`rounded-md border bg-background px-4 last:border-b shadow-sm ${slot.erPassert ? "opacity-50" : ""}`}
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
              <div className="space-y-4">
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
                          {typeof slot.temperatur === "number" && <span>{slot.temperatur}°</span>}
                          {typeof slot.temperatur === "number" &&
                            typeof slot.vind === "number" &&
                            " · "}
                          {typeof slot.vind === "number" && <span>{slot.vind} m/s</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionDetailGrid>

                {/* Actions */}
                {kanUtføreHandling && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
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
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
