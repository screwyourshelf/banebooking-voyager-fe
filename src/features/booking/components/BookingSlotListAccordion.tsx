import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import LoaderSkeleton from "@/components/loading/LoaderSkeleton";
import { Clock, User, Calendar } from "lucide-react";
import { FaCalendarPlus, FaTimesCircle, FaTrashAlt } from "react-icons/fa";
import type { BookingSlotRespons } from "@/types";

type Props = {
  slots: BookingSlotRespons[];
  currentUser: { epost: string } | null;
  onBook?: (slot: BookingSlotRespons) => void;
  onCancel?: (slot: BookingSlotRespons) => void;
  onDelete?: (slot: BookingSlotRespons) => void;
  isLoading?: boolean;
};

export function BookingSlotListAccordion({
  slots,
  currentUser,
  onBook,
  onCancel,
  onDelete,
  isLoading = false,
}: Props) {
  const [bekreftetSlotKey, setBekreftetSlotKey] = useState<string | null>(null);

  if (isLoading) return <LoaderSkeleton />;

  if (slots.length === 0) {
    return (
      <div className="text-muted text-sm italic py-4 text-center">
        Ingen bookinger eller slots å vise.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="rounded-md border bg-background">
      {slots.map((slot) => {
        const slotKey = `${slot.dato}-${slot.startTid}-${slot.baneId}`;
        const tid = `${slot.startTid.slice(0, 5)} – ${slot.sluttTid.slice(0, 5)}`;

        const harArrangement = !!slot.arrangementTittel;
        const erBooket = !!slot.booketAv;
        const erMinBooking = slot.erEier === true;
        const erBekreftet = bekreftetSlotKey === slotKey;

        const harHandlinger = slot.kanBookes || slot.kanAvbestille || slot.kanSlette;
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

        return (
          <AccordionItem
            key={slotKey}
            value={slotKey}
            className={`px-4 ${slot.erPassert ? "opacity-50" : ""}`}
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tid}</span>
                  {slot.værSymbol && (
                    <img
                      src={`${import.meta.env.BASE_URL}weather-symbols/svg/${slot.værSymbol}.svg`}
                      alt={slot.værSymbol}
                      width={18}
                      height={18}
                      className="select-none"
                      draggable={false}
                    />
                  )}
                  <Badge variant={statusVariant} className="text-xs">
                    {statusTekst}
                  </Badge>
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
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Tidspunkt</div>
                      <div className="text-sm">{tid}</div>
                    </div>
                  </div>

                  {erBooket && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">Booket av</div>
                        <div className="text-sm">{slot.booketAv}</div>
                      </div>
                    </div>
                  )}

                  {harArrangement && slot.arrangementBeskrivelse && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">Arrangement</div>
                        <div className="text-sm whitespace-pre-wrap">
                          {slot.arrangementBeskrivelse}
                        </div>
                      </div>
                    </div>
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
                </div>

                {/* Actions */}
                {kanUtføreHandling && (
                  <div className="flex flex-col items-end gap-2 pt-2 border-t">
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
                      </>
                    )}

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
