import { Pencil, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  const erNy = !erEksisterende && !erKonflikt && !erSlettet;

  const fjernLabel = erEksisterende ? "Avlys" : "Fjern";

  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50",
        erSlettet && "opacity-50 line-through",
        erKonflikt && !erSlettet && "bg-amber-50 dark:bg-amber-950/20",
        erNy && "bg-blue-50/60 dark:bg-blue-950/15"
      )}
    >
      {/* Dato */}
      <td className="px-3 py-2 text-sm whitespace-nowrap">{formatDatoMedUkedag(booking.dato)}</td>

      {/* Tid */}
      <td className="px-3 py-2 text-sm whitespace-nowrap">
        {booking.startTid} – {booking.sluttTid}
      </td>

      {/* Bane */}
      <td className="px-3 py-2 text-sm whitespace-nowrap">{booking.baneNavn}</td>

      {/* Status */}
      <td className="px-3 py-2 text-sm whitespace-nowrap">
        {erSlettet ? (
          <span className="text-muted-foreground text-xs">Markert for avlysning</span>
        ) : erKonflikt ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 cursor-default">
                  <TriangleAlert className="size-3 shrink-0" />
                  Konflikt
                </span>
              </TooltipTrigger>
              {booking.konfliktInfo && <TooltipContent>{booking.konfliktInfo}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        ) : erEksisterende ? (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Aktiv
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Ny
          </span>
        )}
      </td>

      {/* Handlinger */}
      <td className="px-3 py-2 text-right whitespace-nowrap">
        {!erSlettet && (
          <div className="inline-flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Rediger booking"
              onClick={() => onRediger(booking.id)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    aria-label={fjernLabel}
                    onClick={() => onFjernEllerAvlys(booking.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{fjernLabel}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </td>
    </tr>
  );
}
