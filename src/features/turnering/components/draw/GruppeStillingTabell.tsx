import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortert.map((d, idx) => (
          <TableRow key={d.gruppeDeltakerId}>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
