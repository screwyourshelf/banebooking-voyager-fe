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
    <div className="tournament-bracket-match">
      {/* Scoreboard */}
      <div className="app-stack app-stack--xs">
        <div className="app-inline">
          <span
            className="tournament-player"
            data-winner={sp1Vant || undefined}
            data-loser={sp2Vant || undefined}
          >
            {sp1Navn}
          </span>
          <div className="tournament-score" data-density="compact">
            {harSett &&
              kamp.resultat!.sett.map((s, i) => (
                <span key={i} data-winner={sp1Vant || undefined}>
                  {s.spiller1Games}
                </span>
              ))}
            {kamp.status === "WalkOver" && sp1Vant && <span className="app-text-caption">W/O</span>}
          </div>
        </div>
        <div className="app-inline">
          <span
            className="tournament-player"
            data-winner={sp2Vant || undefined}
            data-loser={sp1Vant || undefined}
          >
            {sp2Navn}
          </span>
          <div className="tournament-score" data-density="compact">
            {harSett &&
              kamp.resultat!.sett.map((s, i) => (
                <span key={i} data-winner={sp2Vant || undefined}>
                  {s.spiller2Games}
                </span>
              ))}
            {kamp.status === "WalkOver" && sp2Vant && <span className="app-text-caption">W/O</span>}
          </div>
        </div>
      </div>

      {/* Meta + status */}
      <div className="app-inline app-inline--between">
        <div className="tournament-match-card__meta">
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
          <button className="tournament-result-action" onClick={() => onRegistrer(kamp.id)}>
            Registrer
          </button>
        )}
    </div>
  );
}

export function SluttspillBracket({ kamper, onRegistrer, kanRegistrere }: Props) {
  const runder = [...new Set(kamper.map((k) => k.runde))].sort((a, b) => b - a);

  return (
    <div className="tournament-bracket">
      <div className="app-scroll-x">
        <div className="tournament-bracket__rounds">
          {runder.map((runde) => {
            const rundeKamper = kamper
              .filter((k) => k.runde === runde)
              .sort((a, b) => a.bracketPosisjon - b.bracketPosisjon);

            return (
              <div key={runde} className="tournament-bracket__round">
                <div className="tournament-bracket__round-title">{rundeLabel(runde)}</div>
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
      <div className="tournament-bracket__fade" />
    </div>
  );
}
