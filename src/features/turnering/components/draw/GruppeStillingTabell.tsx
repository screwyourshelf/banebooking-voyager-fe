import { cn } from "@/lib/utils";
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground text-xs">
            <th className="text-left py-1 pr-2 font-medium w-6">#</th>
            <th className="text-left py-1 pr-4 font-medium">Spiller</th>
            <th className="text-right py-1 px-2 font-medium">
              <Tooltip>
                <TooltipTrigger className="cursor-default">K</TooltipTrigger>
                <TooltipContent>Kamper spilt</TooltipContent>
              </Tooltip>
            </th>
            <th className="text-right py-1 px-2 font-medium">
              <Tooltip>
                <TooltipTrigger className="cursor-default">S+</TooltipTrigger>
                <TooltipContent>Sett vunnet</TooltipContent>
              </Tooltip>
            </th>
            <th className="text-right py-1 px-2 font-medium">
              <Tooltip>
                <TooltipTrigger className="cursor-default">S-</TooltipTrigger>
                <TooltipContent>Sett tapt</TooltipContent>
              </Tooltip>
            </th>
            <th className="text-right py-1 px-2 font-medium">
              <Tooltip>
                <TooltipTrigger className="cursor-default">G+</TooltipTrigger>
                <TooltipContent>Games vunnet</TooltipContent>
              </Tooltip>
            </th>
            <th className="text-right py-1 px-2 font-medium">
              <Tooltip>
                <TooltipTrigger className="cursor-default">G-</TooltipTrigger>
                <TooltipContent>Games tapt</TooltipContent>
              </Tooltip>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortert.map((d, idx) => (
            <tr
              key={d.gruppeDeltakerId}
              className={cn("border-b last:border-0", d.trukketSeg && "opacity-40 line-through")}
            >
              <td className="py-1.5 pr-2 text-muted-foreground">{idx + 1}</td>
              <td className="py-1.5 pr-4 font-medium">{d.spillerNavn}</td>
              <td className="text-right py-1.5 px-2">
                {d.stilling.kampVunnet + d.stilling.kampTapt}
              </td>
              <td className="text-right py-1.5 px-2">{d.stilling.settVunnet}</td>
              <td className="text-right py-1.5 px-2">{d.stilling.settTapt}</td>
              <td className="text-right py-1.5 px-2">{d.stilling.gameVunnet}</td>
              <td className="text-right py-1.5 px-2">{d.stilling.gameTapt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
