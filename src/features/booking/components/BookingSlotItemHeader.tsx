import { FaChevronDown } from "react-icons/fa";
import type { BookingSlotRespons } from "@/types";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  slot: BookingSlotRespons;
  isOpen: boolean;
  erInteraktiv: boolean;
  currentUser: { epost: string } | null;

  // overrides (brukes av Mine bookinger)
  overrideTitle?: ReactNode;
  leftPrefix?: ReactNode; // dato + ikon + temp/vind
};

export function BookingSlotItemHeader({
  slot,
  isOpen,
  erInteraktiv,
  currentUser,
  overrideTitle,
  leftPrefix,
}: Props) {
  const tid = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;
  const harArrangement = !!slot.arrangementTittel;

  const [erMobil, setErMobil] = useState(false);

  useEffect(() => {
    const sjekkBredde = () => setErMobil(window.innerWidth < 640);
    sjekkBredde();
    window.addEventListener("resize", sjekkBredde);
    return () => window.removeEventListener("resize", sjekkBredde);
  }, []);

  const maksLengde = 40;
  const beskrivelse =
    slot.arrangementBeskrivelse && erMobil && slot.arrangementBeskrivelse.length > maksLengde
      ? slot.arrangementBeskrivelse.slice(0, maksLengde) + "..."
      : slot.arrangementBeskrivelse;

  return (
    <div className="flex items-center">
      <div className="flex flex-1 items-center justify-between min-w-0">
        {/* Venstre cluster */}
        <div className="flex items-center min-w-0">
          {/* LeftPrefix (Mine bookinger): dato + ikon + temp/vind */}
          {leftPrefix ? (
            <div className="mr-2 whitespace-nowrap text-xs text-muted-foreground flex items-center gap-1">
              {leftPrefix}
            </div>
          ) : null}

          {/* Tid */}
          <div className="whitespace-nowrap font-semibold text-sm text-right pr-1">{tid}</div>

          {/* Værikon (index-layout) – kun når vi IKKE bruker leftPrefix */}
          {!leftPrefix ? (
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              {slot.værSymbol ? (
                <img
                  src={`${import.meta.env.BASE_URL}weather-symbols/svg/${slot.værSymbol}.svg`}
                  alt={slot.værSymbol}
                  width={18}
                  height={18}
                  className="select-none"
                  draggable={false}
                />
              ) : (
                <span className="invisible">.</span>
              )}
            </div>
          ) : null}

          {/* Tittel + ev. beskrivelse */}
          <div className="flex-grow text-sm p-1 min-w-0">
            {overrideTitle ? (
              <div className="min-w-0 whitespace-nowrap truncate">{overrideTitle}</div>
            ) : harArrangement ? (
              <div className="min-w-0">
                <div className="font-medium truncate">{slot.arrangementTittel}</div>
                {beskrivelse ? (
                  <div className="text-xs text-gray-600 truncate">{beskrivelse}</div>
                ) : null}
              </div>
            ) : (
              <div className="min-w-0 whitespace-nowrap truncate">
                {slot.booketAv ? (currentUser ? slot.booketAv : maskEmail(slot.booketAv)) : "Ledig"}
              </div>
            )}
          </div>
        </div>

        {/* Pilindikator */}
        {erInteraktiv ? (
          <div className="p-1 shrink-0">
            <FaChevronDown
              size={12}
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
              aria-hidden="true"
            />
          </div>
        ) : (
          <div className="p-1 shrink-0" />
        )}
      </div>
    </div>
  );
}

function maskEmail(epost: string): string {
  const [name, domain] = epost.split("@");
  if (!name || !domain) return epost;
  return `${name[0]}***@${domain}`;
}
