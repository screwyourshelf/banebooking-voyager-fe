import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { RecordCard, RecordCardStatic } from "@/components/records/RecordCard";
import { Button } from "@/components/ui/button";
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

function SpillerRad({
  navn,
  vant,
  tapte,
  sett,
  walkOver,
}: {
  navn: string;
  vant: boolean;
  tapte: boolean;
  sett: number[];
  walkOver: boolean;
}) {
  const spiller = tapte ? (
    <span>{navn}</span>
  ) : vant ? (
    <strong>{navn}</strong>
  ) : (
    <span>{navn}</span>
  );

  return (
    <div>
      {spiller}
      <span>
        {sett.map((games, index) => (
          <span key={index}>{games}</span>
        ))}
        {walkOver && vant ? <span>W/O</span> : null}
      </span>
    </div>
  );
}

export function KampKort({ kamp, onRegistrer, kanRegistrere }: Props) {
  const vinner = kamp.resultat?.vinner;
  const sp1Navn = kamp.spiller1Navn ?? "TBD";
  const sp2Navn = kamp.spiller2Navn ?? "TBD";
  const sp1Vant = vinner === "Spiller1";
  const sp2Vant = vinner === "Spiller2";
  const harSett = !!kamp.resultat?.sett?.length && kamp.status !== "WalkOver";
  const avslutning = avslutningLabel(kamp.resultat?.avslutning);
  const kanViseRegistrering =
    kanRegistrere &&
    kamp.status !== "Ferdig" &&
    kamp.status !== "WalkOver" &&
    kamp.status !== "Bye" &&
    Boolean(onRegistrer);

  return (
    <RecordCard as="article">
      <RecordCardStatic>
        <div>
          <div>
            <div>
              {"kampNummer" in kamp && kamp.kampNummer ? <span>Kamp {kamp.kampNummer}</span> : null}
              {kamp.bane ? <span>{kamp.bane}</span> : null}
              {kamp.tidspunkt ? (
                <span>{format(parseISO(kamp.tidspunkt), "d. MMM HH:mm", { locale: nb })}</span>
              ) : null}
            </div>
            <div>
              {avslutning ? <span>{avslutning}</span> : null}
              <KampStatusBadge status={kamp.status} />
            </div>
          </div>

          <div>
            <SpillerRad
              navn={sp1Navn}
              vant={sp1Vant}
              tapte={sp2Vant}
              sett={harSett ? kamp.resultat!.sett.map((sett) => sett.spiller1Games) : []}
              walkOver={kamp.status === "WalkOver"}
            />
            <SpillerRad
              navn={sp2Navn}
              vant={sp2Vant}
              tapte={sp1Vant}
              sett={harSett ? kamp.resultat!.sett.map((sett) => sett.spiller2Games) : []}
              walkOver={kamp.status === "WalkOver"}
            />
          </div>
        </div>

        {kanViseRegistrering && onRegistrer ? (
          <Button type="button" variant="outline" size="sm" onClick={() => onRegistrer(kamp.id)}>
            Registrer resultat
          </Button>
        ) : null}
      </RecordCardStatic>
    </RecordCard>
  );
}
