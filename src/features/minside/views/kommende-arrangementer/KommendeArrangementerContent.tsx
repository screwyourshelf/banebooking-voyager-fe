import { Fragment, useEffect, useMemo, useState } from "react";
import PageSection from "@/components/sections/PageSection";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { formatDatoKort, formatDayOfWeeksLangNorsk } from "@/utils/datoUtils";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KommendeArrangementDto } from "./types";

type Props = {
    arrangementer: KommendeArrangementDto[];
};

function dagerIgjenFra(startDatoIso: string) {
    const start = new Date(startDatoIso);
    const iDag = new Date();

    const startMidnatt = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const iDagMidnatt = new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate());

    const diffMs = startMidnatt.getTime() - iDagMidnatt.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function datoTekst(arr: KommendeArrangementDto) {
    return arr.startDato === arr.sluttDato
        ? formatDatoKort(arr.startDato)
        : `${formatDatoKort(arr.startDato)} – ${formatDatoKort(arr.sluttDato)}`;
}

function kortTekst(text: string, max = 45) {
    const t = text.trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max).trimEnd()}…`;
}

function listeTekst(values: string[] | undefined) {
    if (!values || values.length === 0) return "—";
    return values.join(", ");
}

export default function KommendeArrangementerContent({ arrangementer }: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const ids = useMemo(() => new Set(arrangementer.map((a) => a.id)), [arrangementer]);

    useEffect(() => {
        if (expandedId && !ids.has(expandedId)) setExpandedId(null);
    }, [expandedId, ids]);

    return (
        <PageSection
            title="Kommende arrangementer"
            description="Oversikt over arrangementer som er planlagt fremover."
        >
            {arrangementer.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Ingen arrangementer registrert.</p>
            ) : (
                <div className="overflow-auto rounded-md border bg-background">
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hva</TableHead>
                                <TableHead className="whitespace-nowrap">Når</TableHead>
                                <TableHead className="text-right whitespace-nowrap">Om</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {arrangementer.map((arr) => {
                                const dagerIgjen = dagerIgjenFra(arr.startDato);

                                const beskrivelse = arr.beskrivelse?.trim() ?? "";
                                const harBeskrivelse = beskrivelse.length > 0;
                                const erLangBeskrivelse = beskrivelse.length > 45;

                                const harMeta =
                                    (arr.baner?.length ?? 0) > 0 ||
                                    (arr.ukedager?.length ?? 0) > 0 ||
                                    (arr.tidspunkter?.length ?? 0) > 0;

                                const kanEkspandere = harMeta || (harBeskrivelse && erLangBeskrivelse);
                                const erExpanded = expandedId === arr.id;

                                return (
                                    <Fragment key={arr.id}>
                                        <TableRow
                                            className={cn("hover:bg-muted/50", kanEkspandere && "cursor-pointer")}
                                            onClick={() => {
                                                if (!kanEkspandere) return;
                                                setExpandedId((prev) => (prev === arr.id ? null : arr.id));
                                            }}
                                        >
                                            <TableCell className="align-top">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="font-medium">{arr.tittel}</div>

                                                        {harBeskrivelse ? (
                                                            <div className="text-xs text-muted-foreground">
                                                                {erLangBeskrivelse ? kortTekst(beskrivelse, 45) : beskrivelse}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    {kanEkspandere ? (
                                                        <ChevronDown
                                                            className={cn(
                                                                "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                                                erExpanded && "rotate-180"
                                                            )}
                                                        />
                                                    ) : null}
                                                </div>
                                            </TableCell>

                                            <TableCell className="align-top whitespace-nowrap">
                                                {datoTekst(arr)}
                                            </TableCell>

                                            <TableCell className="align-top text-right whitespace-nowrap text-muted-foreground">
                                                {dagerIgjen} {dagerIgjen === 1 ? "dag" : "dager"}
                                            </TableCell>
                                        </TableRow>

                                        {kanEkspandere && erExpanded ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="bg-muted/30">
                                                    <div className="space-y-3">
                                                        {harBeskrivelse ? (
                                                            <div className="text-sm whitespace-pre-wrap break-words">
                                                                {beskrivelse}
                                                            </div>
                                                        ) : null}

                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <div>
                                                                <div className="text-xs font-medium text-muted-foreground">
                                                                    Baner
                                                                </div>
                                                                <div className="text-sm break-words">
                                                                    {listeTekst(arr.baner)}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="text-xs font-medium text-muted-foreground">
                                                                    Ukedager
                                                                </div>
                                                                <div className="text-sm break-words">
                                                                    {formatDayOfWeeksLangNorsk(arr.ukedager)}
                                                                </div>
                                                            </div>

                                                            <div className="sm:col-span-2">
                                                                <div className="text-xs font-medium text-muted-foreground">
                                                                    Tidspunkter
                                                                </div>
                                                                <div className="text-sm break-words">
                                                                    {listeTekst(arr.tidspunkter)}
                                                                    {arr.slotLengdeMinutter ? (
                                                                        <span className="text-muted-foreground">
                                                                            {" "}
                                                                            ({arr.slotLengdeMinutter} min)
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : null}
                                    </Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </PageSection>
    );
}
