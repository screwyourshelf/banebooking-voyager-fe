import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { KampStatusBadge } from "./KampStatusBadge";
import type { GruppeKampVisning, SluttspillKampVisning } from "@/types";

type Props = {
  kamp: GruppeKampVisning | SluttspillKampVisning;
  onRegistrer?: (kampId: string) => void;
  kanRegistrere: boolean;
};

function avslutningLabel(avslutning: string | undefined): string | null {
  if (avslutning === "Retired") return "Ret.";
  if (avslutning === "Default") return "Def.";
  return null;
}

export function KampKort({ kamp, onRegistrer, kanRegistrere }: Props) {
  const vinner = kamp.resultat?.vinner;
  const sp1Navn = kamp.spiller1Navn ?? "TBD";
  const sp2Navn = kamp.spiller2Navn ?? "TBD";
  const sp1Vant = vinner === "Spiller1";
  const sp2Vant = vinner === "Spiller2";
  const harSett = !!kamp.resultat?.sett?.length && kamp.status !== "WalkOver";
  const avslutning = avslutningLabel(kamp.resultat?.avslutning);

  return (
    <div className="rounded-lg border bg-background p-2.5 space-y-1.5">
      {/* Meta + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
          {"kampNummer" in kamp && kamp.kampNummer && <span>Kamp {kamp.kampNummer}</span>}
          {kamp.bane && <span>{kamp.bane}</span>}
          {kamp.tidspunkt && (
            <span>{format(parseISO(kamp.tidspunkt), "d. MMM HH:mm", { locale: nb })}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {avslutning && <span className="text-xs text-muted-foreground">{avslutning}</span>}
          <KampStatusBadge status={kamp.status} />
        </div>
      </div>

      {/* Scoreboard */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex-1 min-w-0 truncate text-sm",
              sp1Vant && "font-semibold",
              sp2Vant && "text-muted-foreground"
            )}
          >
            {sp1Navn}
          </span>
          <div className="flex gap-1 shrink-0 tabular-nums text-sm">
            {harSett &&
              kamp.resultat!.sett.map((s, i) => (
                <span key={i} className={cn("w-4 text-center", sp1Vant && "font-semibold")}>
                  {s.spiller1Games}
                </span>
              ))}
            {kamp.status === "WalkOver" && sp1Vant && (
              <span className="text-xs text-muted-foreground">W/O</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex-1 min-w-0 truncate text-sm",
              sp2Vant && "font-semibold",
              sp1Vant && "text-muted-foreground"
            )}
          >
            {sp2Navn}
          </span>
          <div className="flex gap-1 shrink-0 tabular-nums text-sm">
            {harSett &&
              kamp.resultat!.sett.map((s, i) => (
                <span key={i} className={cn("w-4 text-center", sp2Vant && "font-semibold")}>
                  {s.spiller2Games}
                </span>
              ))}
            {kamp.status === "WalkOver" && sp2Vant && (
              <span className="text-xs text-muted-foreground">W/O</span>
            )}
          </div>
        </div>
      </div>

      {kanRegistrere &&
        kamp.status !== "Ferdig" &&
        kamp.status !== "WalkOver" &&
        kamp.status !== "Bye" &&
        onRegistrer && (
          <button
            className="mt-0.5 w-full rounded border border-primary/40 py-1.5 text-xs font-medium text-primary active:bg-primary/5"
            onClick={() => onRegistrer(kamp.id)}
          >
            Registrer resultat
          </button>
        )}
    </div>
  );
}
