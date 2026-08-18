import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GruppeDeltakerVisning, RangeringsKriterium } from "@/types";
import { useStillingsForklaring } from "../../hooks/draw/useStillingsForklaring";

const KRITERIUM_LABEL: Record<RangeringsKriterium, string> = {
  KamperVunnet: "Kamper vunnet",
  InnbyrdesOppgjør: "Innbyrdes oppgjør",
  Settdifferanse: "Settdifferanse",
  Gamedifferanse: "Gamedifferanse",
  Seeding: "Seeding",
};

type Props = {
  deltakere: GruppeDeltakerVisning[];
  turneringId: string;
  klasseId: string;
  gruppeId: string;
};

export function GruppeStillingTabellMedForklaring({
  deltakere,
  turneringId,
  klasseId,
  gruppeId,
}: Props) {
  const [åpenId, setÅpenId] = useState<string | null>(null);
  const { data: forklaring } = useStillingsForklaring(turneringId, klasseId, gruppeId, true);

  const sortert = [...deltakere].sort((a, b) => {
    if (b.stilling.kampVunnet !== a.stilling.kampVunnet)
      return b.stilling.kampVunnet - a.stilling.kampVunnet;
    const settDiffA = a.stilling.settVunnet - a.stilling.settTapt;
    const settDiffB = b.stilling.settVunnet - b.stilling.settTapt;
    if (settDiffB !== settDiffA) return settDiffB - settDiffA;
    const gameDiffA = a.stilling.gameVunnet - a.stilling.gameTapt;
    const gameDiffB = b.stilling.gameVunnet - b.stilling.gameTapt;
    return gameDiffB - gameDiffA;
  });

  const forklaringMap = new Map(forklaring?.plasseringer.map((p) => [p.gruppeDeltakerId, p]) ?? []);

  const harForklaring = !!forklaring;

  return (
    <div className="app-scroll-x">
      <table className="app-table">
        <thead>
          <tr className="app-table__head">
            <th className="app-table__heading">#</th>
            <th className="app-table__heading">Spiller</th>
            <th className="app-table__heading">
              <Tooltip>
                <TooltipTrigger className="app-tooltip-trigger">K</TooltipTrigger>
                <TooltipContent>Kamper spilt</TooltipContent>
              </Tooltip>
            </th>
            <th className="app-table__heading">
              <Tooltip>
                <TooltipTrigger className="app-tooltip-trigger">S+</TooltipTrigger>
                <TooltipContent>Sett vunnet</TooltipContent>
              </Tooltip>
            </th>
            <th className="app-table__heading">
              <Tooltip>
                <TooltipTrigger className="app-tooltip-trigger">S-</TooltipTrigger>
                <TooltipContent>Sett tapt</TooltipContent>
              </Tooltip>
            </th>
            <th className="app-table__heading">
              <Tooltip>
                <TooltipTrigger className="app-tooltip-trigger">G+</TooltipTrigger>
                <TooltipContent>Games vunnet</TooltipContent>
              </Tooltip>
            </th>
            <th className="app-table__heading">
              <Tooltip>
                <TooltipTrigger className="app-tooltip-trigger">G-</TooltipTrigger>
                <TooltipContent>Games tapt</TooltipContent>
              </Tooltip>
            </th>
            <th className="tournament-table__disclosure" />
          </tr>
        </thead>
        <tbody>
          {sortert.map((d, idx) => {
            const erÅpen = åpenId === d.gruppeDeltakerId;
            const plassForklaring = forklaringMap.get(d.gruppeDeltakerId);

            return (
              <Fragment key={d.gruppeDeltakerId}>
                <tr
                  className="tournament-table__row"
                  data-withdrawn={d.trukketSeg || undefined}
                  data-interactive={harForklaring || undefined}
                  data-open={erÅpen || undefined}
                  onClick={() => harForklaring && setÅpenId(erÅpen ? null : d.gruppeDeltakerId)}
                >
                  <td className="app-table__cell">{idx + 1}</td>
                  <td className="app-table__cell">{d.spillerNavn}</td>
                  <td className="app-table__cell">{d.stilling.kampVunnet + d.stilling.kampTapt}</td>
                  <td className="app-table__cell">{d.stilling.settVunnet}</td>
                  <td className="app-table__cell">{d.stilling.settTapt}</td>
                  <td className="app-table__cell">{d.stilling.gameVunnet}</td>
                  <td className="app-table__cell">{d.stilling.gameTapt}</td>
                  <td className="tournament-table__disclosure-cell">
                    {harForklaring && (
                      <ChevronDown
                        className="tournament-table__disclosure-icon"
                        data-open={erÅpen || undefined}
                      />
                    )}
                  </td>
                </tr>
                {erÅpen && plassForklaring && (
                  <tr className="tournament-table__explanation-row">
                    <td colSpan={8} className="tournament-table__explanation">
                      <span className="tournament-table__criterion">
                        {KRITERIUM_LABEL[plassForklaring.kriterium]}
                      </span>
                      {" – "}
                      {plassForklaring.beskrivelse}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
