import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import SlotListSkeleton from "@/components/loading/SlotListSkeleton";
import { User, Calendar, Timer, Users, UserCheck } from "lucide-react";
import { FaCalendarPlus, FaTimesCircle, FaTrashAlt } from "react-icons/fa";
import PaameldteDialog from "@/features/minside/views/kommende-arrangementer/PaameldteDialog";
import type { BookingSlotRespons } from "@/types";

type Props = {
  slots: BookingSlotRespons[];
  currentUser: { epost: string } | null;
  onBook?: (slot: BookingSlotRespons) => void;
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
  const [bekreftetSlotKey, setBekreftetSlotKey] = useState<string | null>(null);

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

        const harArrangement = !!slot.arrangementTittel;
        const erBooket = !!slot.booketAv;
        const erMinBooking = slot.erEier === true;
        const erBekreftet = bekreftetSlotKey === slotKey;

        const kanMeldePåAv = harArrangement && !!slot.tillaterPaamelding;
        const harHandlinger =
          slot.kanBookes || slot.kanAvbestille || slot.kanSlette || kanMeldePåAv;
        const kanUtføreHandling = !!currentUser && harHandlinger && !slot.erPassert;

        const harVaer =
          !!slot.værSymbol || typeof slot.temperatur === "number" || typeof slot.vind === "number";

        // Bestem status-tekst og variant
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
                  <span className="font-medium">{tid}</span>
                  <WeatherInfo værSymbol={slot.værSymbol} iconOnly />
                  <Badge variant={statusVariant} className="text-xs">
                    {statusTekst}
                  </Badge>
                  {currentUser && (erMinBooking || (harArrangement && slot.tillaterPaamelding && slot.erPaameldt)) && (
                    <span className="text-green-600" title={erMinBooking ? "Din booking" : "Du er påmeldt"}>
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
                      <span className="whitespace-pre-wrap">{slot.arrangementBeskrivelse}</span>
                    </AccordionDetailRow>
                  )}

                  {harArrangement && slot.tillaterPaamelding && slot.arrangementId && (
                    <AccordionDetailRow icon={Users} label="Påmeldte" iconClassName={currentUser && slot.erPaameldt ? "text-green-600" : undefined}>
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
                  <div className="space-y-2 pt-2 border-t">
                    {slot.kanBookes && (
                      <>
                        <div className="flex items-center space-x-2 text-sm">
                          <Checkbox
                            id={`book-${slotKey}`}
                            checked={erBekreftet}
                            onCheckedChange={(checked) =>
                              setBekreftetSlotKey(checked ? slotKey : null)
                            }
                          />
                          <label
                            htmlFor={`book-${slotKey}`}
                            className="cursor-pointer select-none text-sm"
                          >
                            Jeg (og de jeg spiller med) har betalt medlemskap for{" "}
                            {new Date().getFullYear()}
                          </label>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!erBekreftet}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBook?.(slot);
                              setBekreftetSlotKey(null);
                            }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <FaCalendarPlus />
                            Book
                          </Button>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-end gap-2">
                      {slot.kanAvbestille && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel?.(slot);
                          }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <FaTimesCircle />
                          Avbestill
                        </Button>
                      )}

                      {slot.kanSlette && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(slot);
                          }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <FaTrashAlt />
                          Slett
                        </Button>
                      )}

                      {kanMeldePåAv &&
                        (slot.erPaameldt ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMeldAv?.(slot);
                            }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <FaTimesCircle />
                            Meld meg av
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMeldPaa?.(slot);
                            }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <FaCalendarPlus />
                            Meld meg på
                          </Button>
                        ))}
                    </div>
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
