import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const forklaringMap = new Map(
    forklaring?.plasseringer.map((p) => [p.gruppeDeltakerId, p]) ?? []
  );

  const harForklaring = !!forklaring;

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
            <th className="w-5" />
          </tr>
        </thead>
        <tbody>
          {sortert.map((d, idx) => {
            const erÅpen = åpenId === d.gruppeDeltakerId;
            const plassForklaring = forklaringMap.get(d.gruppeDeltakerId);

            return (
              <Fragment key={d.gruppeDeltakerId}>
                <tr
                  className={cn(
                    "border-b",
                    d.trukketSeg && "opacity-40 line-through",
                    harForklaring && "cursor-pointer hover:bg-muted/50 transition-colors",
                    erÅpen && "border-b-0"
                  )}
                  onClick={() =>
                    harForklaring &&
                    setÅpenId(erÅpen ? null : d.gruppeDeltakerId)
                  }
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
                  <td className="py-1.5 pl-2 text-muted-foreground">
                    {harForklaring && (
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform duration-200",
                          erÅpen && "rotate-180"
                        )}
                      />
                    )}
                  </td>
                </tr>
                {erÅpen && plassForklaring && (
                  <tr className="border-b bg-muted/30">
                    <td colSpan={8} className="px-2 py-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
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
