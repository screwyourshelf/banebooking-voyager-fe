import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GruppeDeltakerVisning } from "@/types";

type Props = {
  deltakere: GruppeDeltakerVisning[];
};

export function GruppeStillingTabell({ deltakere }: Props) {
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
          </tr>
        </thead>
        <tbody>
          {sortert.map((d, idx) => (
            <tr
              key={d.gruppeDeltakerId}
              className="tournament-table__row"
              data-withdrawn={d.trukketSeg || undefined}
            >
              <td className="app-table__cell">{idx + 1}</td>
              <td className="app-table__cell">{d.spillerNavn}</td>
              <td className="app-table__cell">{d.stilling.kampVunnet + d.stilling.kampTapt}</td>
              <td className="app-table__cell">{d.stilling.settVunnet}</td>
              <td className="app-table__cell">{d.stilling.settTapt}</td>
              <td className="app-table__cell">{d.stilling.gameVunnet}</td>
              <td className="app-table__cell">{d.stilling.gameTapt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
