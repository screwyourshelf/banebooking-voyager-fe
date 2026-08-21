import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Spiller</TableHead>
          <TableHead>
            <Tooltip>
              <TooltipTrigger>K</TooltipTrigger>
              <TooltipContent>Kamper spilt</TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead>
            <Tooltip>
              <TooltipTrigger>S+</TooltipTrigger>
              <TooltipContent>Sett vunnet</TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead>
            <Tooltip>
              <TooltipTrigger>S-</TooltipTrigger>
              <TooltipContent>Sett tapt</TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead>
            <Tooltip>
              <TooltipTrigger>G+</TooltipTrigger>
              <TooltipContent>Games vunnet</TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead>
            <Tooltip>
              <TooltipTrigger>G-</TooltipTrigger>
              <TooltipContent>Games tapt</TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead>Detaljer</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortert.map((d, idx) => {
          const erÅpen = åpenId === d.gruppeDeltakerId;
          const plassForklaring = forklaringMap.get(d.gruppeDeltakerId);

          return (
            <Fragment key={d.gruppeDeltakerId}>
              <TableRow data-state={erÅpen ? "selected" : undefined}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <span>
                    {d.spillerNavn}
                    {d.trukketSeg ? <Badge variant="outline">Trukket</Badge> : null}
                  </span>
                </TableCell>
                <TableCell>{d.stilling.kampVunnet + d.stilling.kampTapt}</TableCell>
                <TableCell>{d.stilling.settVunnet}</TableCell>
                <TableCell>{d.stilling.settTapt}</TableCell>
                <TableCell>{d.stilling.gameVunnet}</TableCell>
                <TableCell>{d.stilling.gameTapt}</TableCell>
                <TableCell>
                  {harForklaring && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`${erÅpen ? "Skjul" : "Vis"} rangeringsforklaring for ${d.spillerNavn}`}
                      aria-expanded={erÅpen}
                      onClick={() => setÅpenId(erÅpen ? null : d.gruppeDeltakerId)}
                    >
                      {erÅpen ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              {erÅpen && plassForklaring && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <strong>{KRITERIUM_LABEL[plassForklaring.kriterium]}</strong>
                    {" – "}
                    {plassForklaring.beskrivelse}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
