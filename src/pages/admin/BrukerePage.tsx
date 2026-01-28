import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBruker } from "../../hooks/useBruker.js";
import { useAdminBrukere } from "../../hooks/useAdminBrukere.js";

import { Button } from "@/components/ui/button.js";
import { Card, CardContent } from "@/components/ui/card.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import { FormField } from "@/components/FormField.js";
import { SelectField } from "@/components/SelectField.js";
import { FaEdit } from "react-icons/fa";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.js";

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table.js";

import type { RolleType, BrukerDto } from "../../types/index.js";
import { FieldWrapper } from "../../components/FieldWrapper.js";

export default function BrukerePage() {
    const { slug } = useParams<{ slug: string }>();
    const { bruker, laster: lasterBruker } = useBruker(slug);

    const {
        brukere,
        laster: lasterListe,
        oppdater,
        oppdaterLaster,
        // error, // hvis du har den i hooken
    } = useAdminBrukere(slug);

    const [query, setQuery] = useState("");
    const [aktivBruker, setAktivBruker] = useState<BrukerDto | null>(null);
    const [redigerRolle, setRedigerRolle] = useState<RolleType>("Medlem");
    const [redigerVisningsnavn, setRedigerVisningsnavn] = useState("");

    const erKlubbAdmin = bruker?.roller.includes("KlubbAdmin");

    const filtrerteBrukere = useMemo(() => {
        const q = query.toLowerCase().trim();
        return brukere.filter(
            (b) =>
                b.epost?.toLowerCase().includes(q) ||
                b.visningsnavn?.toLowerCase().includes(q)
        );
    }, [brukere, query]);

    const åpneRedigering = (b: BrukerDto) => {
        setAktivBruker(b);
        setRedigerRolle((b.roller[0] ?? "Medlem") as RolleType);
        setRedigerVisningsnavn(b.visningsnavn ?? "");
    };

    const lagreEndringer = async () => {
        if (!slug || !aktivBruker) return;

        await oppdater(aktivBruker.id, {
            rolle: redigerRolle,
            visningsnavn: redigerVisningsnavn,
        });

        setAktivBruker(null);
    };

    if (lasterBruker) return <LoaderSkeleton />;

    if (!erKlubbAdmin) {
        return (
            <p className="text-sm text-destructive px-2 py-2 text-center">
                Du har ikke tilgang til denne siden.
            </p>
        );
    }

    return (
        <div className="max-w-screen-sm mx-auto px-2 py-2 space-y-4">
            <Card>
                <CardContent className="p-4 space-y-4">
                    <FormField
                        id="sok"
                        label="Søk etter bruker"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        helpText="F.eks. navn eller e-post"
                    />

                    {lasterListe && <p>Laster brukere...</p>}
                    {!lasterListe && filtrerteBrukere.length === 0 && (
                        <p className="text-muted-foreground">Ingen brukere funnet</p>
                    )}

                    {!lasterListe && filtrerteBrukere.length > 0 && (
                        <div className="max-w-full overflow-x-auto border rounded-md">
                            <Table className="text-sm w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[140px]">Bruker</TableHead>
                                        <TableHead className="w-2/6">Rolle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtrerteBrukere.map((b) => {
                                        const erMeg = b.id === bruker?.id;
                                        return (
                                            <TableRow key={b.id}>
                                                <TableCell className="whitespace-nowrap max-w-[180px]">
                                                    <div className="flex justify-between items-start gap-2 overflow-hidden">
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="font-medium truncate" title={b.epost}>
                                                                {b.epost}
                                                            </div>
                                                            {b.visningsnavn && (
                                                                <div
                                                                    className="text-muted-foreground text-xs truncate"
                                                                    title={b.visningsnavn}
                                                                >
                                                                    {b.visningsnavn}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {!erMeg && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => åpneRedigering(b)}
                                                                title="Rediger"
                                                                className="text-muted-foreground hover:text-primary"
                                                            >
                                                                <FaEdit className="w-4 h-4" />
                                                                <span className="sr-only">Rediger</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    {b.roller[0] ?? "Medlem"}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {aktivBruker && (
                <Dialog
                    open
                    onOpenChange={(open) => {
                        if (!open) setAktivBruker(null);
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rediger bruker</DialogTitle>
                        </DialogHeader>

                        <FieldWrapper id="epost" label="Brukernavn / ID">
                            <p className="text-sm text-foreground">{aktivBruker.epost}</p>
                        </FieldWrapper>

                        <div className="space-y-4">
                            <FormField
                                id="visningsnavn"
                                label="Visningsnavn"
                                value={redigerVisningsnavn}
                                onChange={(e) => setRedigerVisningsnavn(e.target.value)}
                            />

                            <SelectField
                                id="rolle"
                                label="Rolle"
                                value={redigerRolle}
                                onChange={(val) => setRedigerRolle(val as RolleType)}
                                options={[
                                    { label: "Medlem", value: "Medlem" },
                                    { label: "Utvidet", value: "Utvidet" },
                                    { label: "KlubbAdmin", value: "KlubbAdmin" },
                                ]}
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setAktivBruker(null)} disabled={oppdaterLaster}>
                                Avbryt
                            </Button>
                            <Button onClick={lagreEndringer} disabled={oppdaterLaster}>
                                {oppdaterLaster ? "Lagrer..." : "Lagre"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
