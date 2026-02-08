import { formatDatoKort } from "@/utils/datoUtils";
import type { BookingSlotRespons } from "@/types";

type Props = { slot: BookingSlotRespons };

export default function BookingSlotHeaderLeft({ slot }: Props) {
  const harTemp = typeof slot.temperatur === "number";
  const harVind = typeof slot.vind === "number";
  const harVaerInfo = !!slot.værSymbol || harTemp || harVind;

  if (!harVaerInfo) {
    return (
      <span className="flex items-center gap-1">
        <span>{formatDatoKort(slot.dato)}</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <span>{formatDatoKort(slot.dato)}</span>

      <span className="w-[18px] h-[18px] flex items-center justify-center">
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
      </span>

      {harTemp || harVind ? (
        <span className="text-[11px] text-muted-foreground">
          {harTemp ? `${slot.temperatur}°` : null}
          {harTemp && harVind ? " · " : null}
          {harVind ? `${slot.vind} m/s` : null}
        </span>
      ) : null}
    </span>
  );
}
