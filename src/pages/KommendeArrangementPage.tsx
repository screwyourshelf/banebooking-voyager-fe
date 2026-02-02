import { useArrangement } from "@/hooks/useArrangement";

import LoaderSkeleton from "@/components/LoaderSkeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatDatoKort } from "@/utils/datoUtils";
import { Button } from "@/components/ui/button";
import { FaTrashAlt } from "react-icons/fa";
import SlettArrangementDialog from "@/components/SlettArrangementDialog";
import Page from "@/components/Page";

export default function KommendeArrangementPage() {
  const { arrangementer, isLoading, slettArrangement } = useArrangement();

  return (
    <Page>
        {isLoading ? (
          <LoaderSkeleton />
        ) : arrangementer.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Ingen arrangementer registrert.
          </p>
        ) : (
          <div className="max-w-full overflow-x-auto border rounded-md">
            <Table className="text-sm w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Hva</TableHead>
                  <TableHead className="w-1/3">Når</TableHead>
                  <TableHead className="w-1/3">Om</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arrangementer.map((arr) => {
                  const start = new Date(arr.startDato);
                  const iDag = new Date();
                  const dagerIgjen = Math.max(
                    0,
                    Math.ceil(
                      (start.getTime() - iDag.getTime()) / (1000 * 60 * 60 * 24)
                    )
                  );

                  return (
                    <TableRow key={arr.id}>
                      <TableCell className="whitespace-normal break-words">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <div className="font-medium">{arr.tittel}</div>
                            {arr.beskrivelse && (
                              <div className="text-muted-foreground text-xs">
                                {arr.beskrivelse}
                              </div>
                            )}
                          </div>
                          {arr.kanSlettes && (
                            <SlettArrangementDialog
                              tittel={arr.tittel}
                              onSlett={() => slettArrangement(arr.id)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:bg-red-100"
                                  title="Avlys"
                                >
                                  <FaTrashAlt className="w-4 h-4" />
                                  <span className="sr-only">Avlys</span>
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-normal break-words text-sm">
                        {arr.startDato === arr.sluttDato
                          ? formatDatoKort(arr.startDato)
                          : `${formatDatoKort(arr.startDato)} - ${formatDatoKort(
                              arr.sluttDato
                            )}`}
                      </TableCell>

                      <TableCell>
                        {dagerIgjen} {dagerIgjen === 1 ? "dag" : "dager"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
    </Page>
  );
}
