import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";

import { formatDatoKort } from "@/utils/datoUtils";

type Bane = { id: string; navn: string };
type Slot = { dato: string; startTid: string; sluttTid: string; baneId: string };

type Props = {
    baner: Bane[];
    beskrivelse: string;
    forhandsvisning: { ledige: Slot[]; konflikter: Slot[] };
};

export default function ForhandsvisningTable({ baner, beskrivelse, forhandsvisning }: Props) {
    const alleSlots = [...forhandsvisning.ledige, ...forhandsvisning.konflikter].sort(
        (a, b) =>
            a.dato.localeCompare(b.dato) ||
            a.startTid.localeCompare(b.startTid) ||
            a.baneId.localeCompare(b.baneId)
    );

    return (
        <div className="overflow-auto max-h-[60vh] border rounded-md">
            <Table className="text-sm">
                <TableHeader>
                    <TableRow>
                        <TableHead>Dato</TableHead>
                        <TableHead>Klokkeslett</TableHead>
                        <TableHead>Bane</TableHead>
                        <TableHead>Beskrivelse</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {alleSlots.map((slot) => {
                        const bane = baner.find((b) => b.id === slot.baneId);
                        const erKonflikt = forhandsvisning.konflikter.some(
                            (k) =>
                                k.baneId === slot.baneId &&
                                k.dato === slot.dato &&
                                k.startTid === slot.startTid &&
                                k.sluttTid === slot.sluttTid
                        );

                        return (
                            <TableRow
                                key={`${slot.dato}-${slot.baneId}-${slot.startTid}`}
                                className={erKonflikt ? "bg-yellow-100" : ""}
                            >
                                <TableCell>{formatDatoKort(slot.dato)}</TableCell>
                                <TableCell>
                                    {slot.startTid} – {slot.sluttTid}
                                </TableCell>
                                <TableCell>{bane?.navn ?? "(ukjent bane)"}</TableCell>
                                <TableCell>
                                    {beskrivelse}
                                    {erKonflikt && (
                                        <span className="ml-2 text-yellow-700 text-xs italic">
                                            (Konflikt)
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
