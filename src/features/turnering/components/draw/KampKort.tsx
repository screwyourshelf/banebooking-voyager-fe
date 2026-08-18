import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
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
    <div className="tournament-match-card">
      {/* Meta + status */}
      <div className="app-inline app-inline--between">
        <div className="tournament-match-card__meta">
          {"kampNummer" in kamp && kamp.kampNummer && <span>Kamp {kamp.kampNummer}</span>}
          {kamp.bane && <span>{kamp.bane}</span>}
          {kamp.tidspunkt && (
            <span>{format(parseISO(kamp.tidspunkt), "d. MMM HH:mm", { locale: nb })}</span>
          )}
        </div>
        <div className="tournament-match-card__status">
          {avslutning && <span className="app-text-caption">{avslutning}</span>}
          <KampStatusBadge status={kamp.status} />
        </div>
      </div>

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
          <div className="tournament-score">
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
          <div className="tournament-score">
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

      {kanRegistrere &&
        kamp.status !== "Ferdig" &&
        kamp.status !== "WalkOver" &&
        kamp.status !== "Bye" &&
        onRegistrer && (
          <button className="tournament-result-action" onClick={() => onRegistrer(kamp.id)}>
            Registrer resultat
          </button>
        )}
    </div>
  );
}
