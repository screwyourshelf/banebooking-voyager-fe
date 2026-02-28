import { useState } from "react";
import { BookingSlotItemHeader } from "./BookingSlotItemHeader";
import { BookingSlotItemExpanded } from "./BookingSlotItemExpanded";
import type { BookingSlotRespons } from "@/types";

type Props = {
  slot: BookingSlotRespons;
  currentUser: { epost: string } | null;
  isOpen?: boolean;
  onToggle?: () => void;
  onBook?: (slot: BookingSlotRespons) => void;
  onCancel?: (slot: BookingSlotRespons) => void;
  onDelete?: (slot: BookingSlotRespons) => void;

  // NYTT: brukes av Mine bookinger
  headerOverrideTitle?: React.ReactNode;
  headerLeftPrefix?: React.ReactNode;
  erInteraktivOverride?: boolean;
};

export default function BookingSlotItem({
  slot,
  currentUser,
  isOpen = false,
  onToggle,
  onBook = () => {},
  onCancel = () => {},
  onDelete = () => {},

  headerOverrideTitle,
  headerLeftPrefix,
  erInteraktivOverride,
}: Props) {
  const [erBekreftet, setErBekreftet] = useState(false);
  const reset = () => setErBekreftet(false);

  const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
  const harHandlinger = slot.kanBookes || slot.kanAvbestille || slot.kanSlette;

  const erInteraktiv = erInteraktivOverride ?? (!!currentUser && harHandlinger && !slot.erPassert);

  const harArrangement = !!slot.arrangementTittel;
  const erMinBooking = slot.erEier === true;

  const className = [
    "rounded shadow-sm p-2 mb-2",
    "transition-colors duration-300 ease-in-out",
    slot.erPassert ? "bg-muted text-muted-foreground border border-border" : "",
    !slot.erPassert && harArrangement
      ? "bg-card text-foreground border-l-4 border-l-primary border-y border-r border-border"
      : "",
    !slot.erPassert && !harArrangement ? "bg-card text-card-foreground border border-border" : "",
    currentUser && erMinBooking && !harArrangement
      ? "animate__animated animate__headShake animate__slow"
      : "",
  ].join(" ");

  const handleToggle = () => {
    if (erInteraktiv && onToggle) {
      onToggle();
      setErBekreftet(false);
    }
  };

  return (
    <div
      className={`${className} ${erInteraktiv ? "cursor-pointer" : "cursor-default"} ${slot.erPassert ? "opacity-50" : "opacity-100"}`}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button, input, label")) return;
        handleToggle();
      }}
      role={erInteraktiv ? "button" : undefined}
      tabIndex={erInteraktiv ? 0 : undefined}
      onKeyDown={(e) => {
        if (!erInteraktiv) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <BookingSlotItemHeader
        slot={slot}
        isOpen={isOpen}
        erInteraktiv={erInteraktiv}
        currentUser={currentUser}
        overrideTitle={headerOverrideTitle}
        leftPrefix={headerLeftPrefix}
      />

      {isOpen && !slot.erPassert && (
        <BookingSlotItemExpanded
          slot={slot}
          time={tid}
          erBekreftet={erBekreftet}
          setErBekreftet={setErBekreftet}
          onBook={onBook}
          onCancel={onCancel}
          onDelete={onDelete}
          reset={reset}
        />
      )}
    </div>
  );
}
