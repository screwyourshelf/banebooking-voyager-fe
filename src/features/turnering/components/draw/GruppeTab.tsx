import Tabs from "@/components/navigation/Tabs";
import { GruppeStillingTabellMedForklaring } from "./GruppeStillingTabellMedForklaring";
import { GruppeStillingTabell } from "./GruppeStillingTabell";
import { KampKort } from "./KampKort";
import type { TurneringGruppeVisning } from "@/types";

type Props = {
  gruppe: TurneringGruppeVisning;
  turneringId: string;
  klasseId: string;
  kanRegistrere?: boolean;
  onRegistrer?: (kampId: string) => void;
  visForklaring?: boolean;
};

export function GruppeTab({
  gruppe,
  turneringId,
  klasseId,
  kanRegistrere = false,
  onRegistrer,
  visForklaring = false,
}: Props) {
  const items = [
    {
      value: "stilling",
      label: "Stilling",
      content: visForklaring ? (
        <GruppeStillingTabellMedForklaring
          deltakere={gruppe.deltakere}
          turneringId={turneringId}
          klasseId={klasseId}
          gruppeId={gruppe.id}
        />
      ) : (
        <GruppeStillingTabell deltakere={gruppe.deltakere} />
      ),
    },
    {
      value: "kamper",
      label: "Kamper",
      content: (
        <div className="app-stack app-stack--sm">
          {gruppe.kamper.map((kamp) => (
            <KampKort
              key={kamp.id}
              kamp={kamp}
              kanRegistrere={kanRegistrere}
              onRegistrer={onRegistrer}
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="app-stack app-stack--sm">
      {gruppe.foreslåttBane && <p className="app-text-muted">Bane: {gruppe.foreslåttBane}</p>}
      <Tabs items={items} />
    </div>
  );
}
