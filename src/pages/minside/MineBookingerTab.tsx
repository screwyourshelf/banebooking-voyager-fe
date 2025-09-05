import { useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table.js";
import { formatDatoKort } from "@/utils/datoUtils.js";
import { useMineBookinger } from "@/hooks/useMineBookinger.js";

type Props = {
  slug: string;
};

export default function MineBookingerTab({ slug }: Props) {
  const [visHistoriske, setVisHistoriske] = useState(false);

  const { data: bookinger = [], isLoading } = useMineBookinger(
    slug,
    visHistoriske
  );

  const visteBookinger = [...bookinger].sort((a, b) => {
    const datoDiff =
      new Date(b.dato).getTime() - new Date(a.dato).getTime();
    if (datoDiff !== 0) return datoDiff;
    return b.startTid.localeCompare(a.startTid);
  });

  if (isLoading) {
    return <LoaderSkeleton />;
  }

  return (
    <>
      <label className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          checked={visHistoriske}
          onChange={(e) => setVisHistoriske(e.target.checked)}
        />
        <span>Vis også tidligere bookinger</span>
      </label>

      {visteBookinger.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          {visHistoriske
            ? "Du har ingen registrerte bookinger."
            : "Du har ingen kommende bookinger."}
        </p>
      ) : (
        <div className="overflow-auto max-h-[60vh] border rounded-md">
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Dato</TableHead>
                <TableHead>Tid</TableHead>
                <TableHead>Bane</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visteBookinger.map((b, idx) => (
                <TableRow key={idx}>
                  <TableCell>{formatDatoKort(b.dato)}</TableCell>
                  <TableCell>
                    {b.startTid}–{b.sluttTid}
                  </TableCell>
                  <TableCell>{b.baneNavn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
