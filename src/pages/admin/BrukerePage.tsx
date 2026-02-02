import { useMemo, useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import PageSection from "@/components/sections/PageSection";
import { FieldGroup, FieldList, FieldRow } from "@/components/fields";
import { TextField } from "@/components/forms";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useBruker } from "@/hooks/useBruker";
import { useAdminBrukere } from "@/hooks/useAdminBrukere";

import type { RolleType, BrukerDto } from "@/types";

type EditState = {
    rolle: RolleType;
    visningsnavn: string;
};

const ROLLER: RolleType[] = ["Medlem", "Utvidet", "KlubbAdmin"];

function erSlettetEpost(epost?: string | null) {
    if (!epost) return false;
    return epost.toLowerCase().startsWith("slettet_");
}

export default function BrukerePage() {
    const { bruker, laster: lasterBruker } = useBruker();

    const { brukere, laster: lasterListe, oppdater, oppdaterLaster } =
        useAdminBrukere();

    const erKlubbAdmin = bruker?.roller.includes("KlubbAdmin");

    // Filters
    const [query, setQuery] = useState("");
    const [visSlettede, setVisSlettede] = useState(false);
    const [rolleFilter, setRolleFilter] = useState<RolleType[]>([]); // tom = alle

    // Dialog
    const [aktivBruker, setAktivBruker] = useState<BrukerDto | null>(null);
    const [edit, setEdit] = useState<EditState>({ rolle: "Medlem", visningsnavn: "" });

    const filtrerteBrukere = useMemo(() => {
        const q = query.toLowerCase().trim();

        return brukere
            .filter((b) => {
                if (!visSlettede && erSlettetEpost(b.epost)) return false;
                return true;
            })
            .filter((b) => {
                if (rolleFilter.length === 0) return true;
                const rolle = (b.roller?.[0] ?? "Medlem") as RolleType;
                return rolleFilter.includes(rolle);
            })
            .filter((b) => {
                if (!q) return true;
                return (
                    b.epost?.toLowerCase().includes(q) ||
                    b.visningsnavn?.toLowerCase().includes(q)
                );
            });
    }, [brukere, query, visSlettede, rolleFilter]);

    const åpenRedigering = (b: BrukerDto) => {
        setAktivBruker(b);
        setEdit({
            rolle: ((b.roller?.[0] ?? "Medlem") as RolleType) ?? "Medlem",
            visningsnavn: b.visningsnavn ?? "",
        });
    };

    const lagreEndringer = async () => {
        if (!aktivBruker) return;

        await oppdater(aktivBruker.id, {
            rolle: edit.rolle,
            visningsnavn: edit.visningsnavn,
        });

        setAktivBruker(null);
    };

    function toggleRolle(r: RolleType) {
        setRolleFilter((prev) =>
            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
        );
    }

    if (lasterBruker) return <LoaderSkeleton />;

    if (!erKlubbAdmin) {
        return (
            <p className="text-sm text-destructive px-2 py-2 text-center">
                Du har ikke tilgang til denne siden.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <PageSection
                title="Brukere"
                description="Søk etter brukere og endre rolle eller visningsnavn."
            >
                <FieldGroup>
                    <FieldList>

                        <FieldRow title="Filter på rolle" description="">
                            <div className="flex flex-wrap gap-2">
                                {ROLLER.map((r) => {
                                    const aktiv = rolleFilter.includes(r);
                                    return (
                                        <Button
                                            key={r}
                                            type="button"
                                            size="sm"
                                            variant={aktiv ? "default" : "outline"}
                                            onClick={() => toggleRolle(r)}
                                            className="h-8 px-3"
                                        >
                                            {r}
                                        </Button>
                                    );
                                })}
                            </div>

                            {rolleFilter.length > 0 ? (
                                <div className="mt-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setRolleFilter([])}
                                        className="h-8 px-2 text-muted-foreground"
                                    >
                                        Nullstill filter
                                    </Button>
                                </div>
                            ) : null}
                        </FieldRow>

                        <FieldRow
                            title="Vis slettede brukere"
                            description="Inkluder brukere som er anonymisert eller slettet."
                            right={
                                <div className="pt-0.5">
                                    <Switch checked={visSlettede} onCheckedChange={setVisSlettede} />
                                </div>
                            }
                        />

                        <FieldRow title="Søk" description="">
                            <TextField
                                id="brukersok"
                                label="Søk"
                                hideLabel
                                value={query}
                                onValueChange={setQuery}
                                inputProps={{
                                    placeholder: "Søk på e-post eller visningsnavn…",
                                    inputMode: "search",
                                    className: "bg-background",
                                }}
                            />
                        </FieldRow>
                    </FieldList>
                </FieldGroup>

                {/* RESULTATLISTE */}
                <div className="mt-4">
                    {lasterListe ? (
                        <p className="text-sm text-muted-foreground">Laster brukere…</p>
                    ) : filtrerteBrukere.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Ingen brukere funnet.</p>
                    ) : (
                        <FieldGroup>
                            <FieldList>
                                {filtrerteBrukere.map((b) => {
                                    const erMeg = b.id === bruker?.id;
                                    const slettet = erSlettetEpost(b.epost);
                                    const rolle = (b.roller?.[0] ?? "Medlem") as RolleType;

                                    return (
                                        <FieldRow
                                            key={b.id}
                                            title={b.epost ?? "Ukjent bruker"}
                                            description={b.visningsnavn || (slettet ? "Slettet/anonymisert" : "")}
                                            right={
                                                !erMeg && !slettet ? (
                                                    // samme “knapp-look” som ellers (booking/avbestill)
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => åpenRedigering(b)}
                                                    >
                                                        Rediger
                                                    </Button>
                                                ) : null
                                            }
                                            className={cn(slettet && "opacity-70")}
                                        >
                                            <div className="text-sm text-foreground">
                                                <span className="text-muted-foreground">Rolle: </span>
                                                {rolle}
                                                {slettet ? (
                                                    <span className="text-muted-foreground"> (slettet)</span>
                                                ) : null}
                                            </div>
                                        </FieldRow>
                                    );
                                })}
                            </FieldList>
                        </FieldGroup>
                    )}
                </div>
            </PageSection>

            {/* DIALOG */}
            {aktivBruker ? (
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

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Bruker</div>
                                <div className="text-sm font-medium break-words">
                                    {aktivBruker.epost}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Visningsnavn</div>

                                <TextField
                                    id="visningsnavn"
                                    label="Visningsnavn"
                                    hideLabel
                                    value={edit.visningsnavn}
                                    onValueChange={(visningsnavn) =>
                                        setEdit((s) => ({ ...s, visningsnavn }))
                                    }
                                    inputProps={{
                                        placeholder: "Valgfritt",
                                        className: "bg-background",
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Rolle</div>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={edit.rolle}
                                    onChange={(e) =>
                                        setEdit((s) => ({ ...s, rolle: e.target.value as RolleType }))
                                    }
                                >
                                    <option value="Medlem">Medlem</option>
                                    <option value="Utvidet">Utvidet</option>
                                    <option value="KlubbAdmin">KlubbAdmin</option>
                                </select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setAktivBruker(null)}
                                disabled={oppdaterLaster}
                            >
                                Avbryt
                            </Button>
                            <Button onClick={lagreEndringer} disabled={oppdaterLaster}>
                                {oppdaterLaster ? "Lagrer..." : "Lagre"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    );
}
