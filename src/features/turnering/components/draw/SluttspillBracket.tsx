import { cn } from "@/lib/utils";
import { KampStatusBadge } from "./KampStatusBadge";
import type { SluttspillKampVisning } from "@/types";

type Props = {
  kamper: SluttspillKampVisning[];
  onRegistrer?: (kampId: string) => void;
  kanRegistrere: boolean;
};

function rundeLabel(runde: number): string {
  if (runde === 1) return "Finale";
  if (runde === 2) return "Semifinale";
  if (runde === 4) return "Kvartfinale";
  return `Runde av ${runde * 2}`;
}

function KampBoks({
  kamp,
  onRegistrer,
  kanRegistrere,
}: {
  kamp: SluttspillKampVisning;
  onRegistrer?: (id: string) => void;
  kanRegistrere: boolean;
}) {
  const vinner = kamp.resultat?.vinner;
  const sp1Navn = kamp.spiller1Navn ?? "TBD";
  const sp2Navn = kamp.status === "Bye" ? "BYE" : (kamp.spiller2Navn ?? "TBD");
  const sp1Vant = vinner === "Spiller1";
  const sp2Vant = vinner === "Spiller2";
  const harSett = !!kamp.resultat?.sett?.length && kamp.status !== "WalkOver";

  return (
    <div className="rounded-lg border bg-background p-2 w-44 space-y-1.5">
      {/* Scoreboard */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex-1 min-w-0 truncate text-sm",
              sp1Vant && "font-semibold",
              sp2Vant && "text-muted-foreground"
            )}
          >
            {sp1Navn}
          </span>
          <div className="flex gap-0.5 shrink-0 tabular-nums text-sm">
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
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex-1 min-w-0 truncate text-sm",
              sp2Vant && "font-semibold",
              sp1Vant && "text-muted-foreground"
            )}
          >
            {sp2Navn}
          </span>
          <div className="flex gap-0.5 shrink-0 tabular-nums text-sm">
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

      {/* Meta + status */}
      <div className="flex items-center justify-between gap-1">
        <div className="text-xs text-muted-foreground flex gap-1.5">
          {kamp.kampNummer && <span>#{kamp.kampNummer}</span>}
          {kamp.bane && <span>{kamp.bane}</span>}
        </div>
        <KampStatusBadge status={kamp.status} />
      </div>

      {kanRegistrere &&
        kamp.status !== "Ferdig" &&
        kamp.status !== "WalkOver" &&
        kamp.status !== "Bye" &&
        kamp.spiller1Navn &&
        kamp.spiller2Navn &&
        onRegistrer && (
          <button
            className="w-full rounded border border-primary/40 py-1 text-xs font-medium text-primary active:bg-primary/5"
            onClick={() => onRegistrer(kamp.id)}
          >
            Registrer
          </button>
        )}
    </div>
  );
}

export function SluttspillBracket({ kamper, onRegistrer, kanRegistrere }: Props) {
  const runder = [...new Set(kamper.map((k) => k.runde))].sort((a, b) => b - a);

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <div className="flex gap-4 items-start pb-2 min-w-max">
          {runder.map((runde) => {
            const rundeKamper = kamper
              .filter((k) => k.runde === runde)
              .sort((a, b) => a.bracketPosisjon - b.bracketPosisjon);

            return (
              <div key={runde} className="flex flex-col gap-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  {rundeLabel(runde)}
                </div>
                {rundeKamper.map((kamp) => (
                  <KampBoks
                    key={kamp.id}
                    kamp={kamp}
                    onRegistrer={onRegistrer}
                    kanRegistrere={kanRegistrere}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
