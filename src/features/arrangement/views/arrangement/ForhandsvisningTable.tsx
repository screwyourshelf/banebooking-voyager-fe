import { useMemo } from "react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDatoKort } from "@/utils/datoUtils";

import type { ArrangementForhåndsvisningRespons, ArrangementSlotDto } from "../../types";

type Props = {
    beskrivelse: string;
    forhandsvisning: ArrangementForhåndsvisningRespons;
};

function slotKey(s: ArrangementSlotDto) {
    return `${s.dato}|${s.baneId}|${s.startTid}|${s.sluttTid}`;
}

export default function ForhandsvisningTable({ beskrivelse, forhandsvisning }: Props) {
    const konfliktKeys = useMemo(
        () => new Set(forhandsvisning.konflikter.map(slotKey)),
        [forhandsvisning.konflikter]
    );

    const alleSlots = useMemo(() => {
        const merged = [...forhandsvisning.ledige, ...forhandsvisning.konflikter];

        merged.sort(
            (a, b) =>
                a.dato.localeCompare(b.dato) ||
                a.startTid.localeCompare(b.startTid) ||
                a.baneId.localeCompare(b.baneId)
        );

        return merged;
    }, [forhandsvisning.ledige, forhandsvisning.konflikter]);

    return (
        <div className="max-h-[60vh] overflow-auto rounded-md border">
            <Table>
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
                        const erKonflikt = konfliktKeys.has(slotKey(slot));
                        const baneNavn = slot.baneNavn?.trim() || "(ukjent bane)";

                        return (
                            <TableRow
                                key={slotKey(slot)}
                                className={cn("hover:bg-muted/50", erKonflikt && "bg-muted/40")}
                            >
                                <TableCell className="align-top whitespace-nowrap">
                                    {formatDatoKort(slot.dato)}
                                </TableCell>

                                <TableCell className="align-top whitespace-nowrap">
                                    {slot.startTid} – {slot.sluttTid}
                                </TableCell>

                                <TableCell className="align-top whitespace-nowrap">
                                    {baneNavn}
                                </TableCell>

                                <TableCell className="align-top">
                                    {beskrivelse}
                                    {erKonflikt && (
                                        <span className="ml-2 text-xs text-muted-foreground">
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
