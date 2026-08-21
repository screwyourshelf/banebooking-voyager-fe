import { KampKort } from "./KampKort";
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

export function SluttspillBracket({ kamper, onRegistrer, kanRegistrere }: Props) {
  const runder = [...new Set(kamper.map((k) => k.runde))].sort((a, b) => b - a);

  return (
    <div>
      {runder.map((runde) => {
        const rundeKamper = kamper
          .filter((kamp) => kamp.runde === runde)
          .sort((a, b) => a.bracketPosisjon - b.bracketPosisjon);

        return (
          <section key={runde}>
            <h3>{rundeLabel(runde)}</h3>
            {rundeKamper.map((kamp) => (
              <KampKort
                key={kamp.id}
                kamp={kamp}
                onRegistrer={onRegistrer}
                kanRegistrere={kanRegistrere}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
