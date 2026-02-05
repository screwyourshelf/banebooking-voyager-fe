import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row, SwitchRow } from "@/components/rows";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import DatoVelger from "@/components/DatoVelger";
import ForhandsvisningDialog from "./ForhandsvisningDialog";

type Bane = { id: string; navn: string };

type Slot = {
    dato: string;
    startTid: string;
    sluttTid: string;
    baneId: string;
};

type Forhandsvis = {
    ledige: Slot[];
    konflikter: Slot[];
};

type Props<K extends string> = {
    kategorier: readonly K[];
    kategori: K;
    beskrivelse: string;

    datoFra: Date;
    datoTil: Date;

    baner: Bane[];
    tilgjengeligeUkedager: string[];
    tilgjengeligeTidspunkter: string[];

    valgteBaner: string[];
    valgteUkedager: string[];
    valgteTidspunkter: string[];

    alleBaner: boolean;
    alleUkedager: boolean;
    alleTidspunkter: boolean;

    dialogOpen: boolean;
    forhandsvisning: Forhandsvis;
    isLoadingForhandsvisning: boolean;

    onChangeKategori: (v: K) => void;
    onChangeBeskrivelse: (v: string) => void;
    onChangeDatoFra: (d: Date) => void;
    onChangeDatoTil: (d: Date) => void;

    onToggleAlleBaner: (v: boolean) => void;
    onToggleAlleUkedager: (v: boolean) => void;
    onToggleAlleTidspunkter: (v: boolean) => void;

    onToggleBane: (id: string) => void;
    onToggleUkedag: (dag: string) => void;
    onToggleTidspunkt: (tid: string) => void;

    onOpenPreview: () => void;
    onCreate: () => void;
    onDialogOpenChange: (open: boolean) => void;
};


const ukedagKnappRekkefølge = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"] as const;

export default function ArrangementContent<K extends string>(props: Props<K>) {
    const {
        kategorier,
        kategori,
        beskrivelse,

        datoFra,
        datoTil,

        baner,
        tilgjengeligeUkedager,
        tilgjengeligeTidspunkter,

        valgteBaner,
        valgteUkedager,
        valgteTidspunkter,

        alleBaner,
        alleUkedager,
        alleTidspunkter,

        dialogOpen,
        forhandsvisning,
        isLoadingForhandsvisning,

        onChangeKategori,
        onChangeBeskrivelse,
        onChangeDatoFra,
        onChangeDatoTil,

        onToggleAlleBaner,
        onToggleAlleUkedager,
        onToggleAlleTidspunkter,

        onToggleBane,
        onToggleUkedag,
        onToggleTidspunkt,

        onOpenPreview,
        onCreate,
        onDialogOpenChange,
    } = props;

    return (
        <>
            <FormLayout
                onSubmit={(e) => {
                    e.preventDefault();
                    onOpenPreview();
                }}
            >
                {/* ───────────── 1) Type ───────────── */}
                <PageSection
                    title="Type"
                    description="Kategori og beskrivelse for arrangementet."
                >
                    <RowPanel>
                        <RowList>
                            <Row title="Kategori" description="Velg type arrangement.">
                                <Field>
                                    <Label htmlFor="kategori" className="sr-only">
                                        Kategori
                                    </Label>

                                    <Select value={kategori} onValueChange={onChangeKategori}>
                                        <SelectTrigger id="kategori">
                                            <SelectValue placeholder="Velg kategori..." />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {kategorier.map((k) => (
                                                <SelectItem key={k} value={k}>
                                                    {k}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </Row>

                            <Row
                                title="Beskrivelse"
                                description="Vises på bookingene."
                            >
                                <Field>
                                    <Input
                                        id="beskrivelse"
                                        value={beskrivelse}
                                        onChange={(e) =>
                                            onChangeBeskrivelse(e.target.value)
                                        }
                                    />
                                </Field>
                            </Row>
                        </RowList>
                    </RowPanel>
                </PageSection>

                {/* ───────────── 2) Periode ───────────── */}
                <PageSection
                    title="Periode"
                    description="Velg dato-intervallet og hvilke ukedager som gjelder."
                >
                    <RowPanel>
                        <RowList>
                            <Row title="Fra" description="Startdato.">
                                <DatoVelger
                                    value={datoFra}
                                    onChange={onChangeDatoFra}
                                    visNavigering
                                />
                            </Row>

                            <Row title="Til" description="Sluttdato.">
                                <DatoVelger
                                    value={datoTil}
                                    onChange={onChangeDatoTil}
                                    visNavigering
                                />
                            </Row>

                            <SwitchRow
                                title="Alle gyldige dager"
                                description="Velger automatisk alle dager som finnes i perioden."
                                checked={alleUkedager}
                                onCheckedChange={onToggleAlleUkedager}
                            />

                            <Row
                                title="Ukedager"
                                description="Bare dager som finnes i perioden er aktive."
                            >
                                <div className="flex flex-wrap gap-2">
                                    {ukedagKnappRekkefølge.map((dag) => (
                                        <Button
                                            key={dag}
                                            type="button"
                                            variant={
                                                valgteUkedager.includes(dag)
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() => onToggleUkedag(dag)}
                                            disabled={
                                                alleUkedager ||
                                                !tilgjengeligeUkedager.includes(dag)
                                            }
                                        >
                                            {dag}
                                        </Button>
                                    ))}
                                </div>
                            </Row>
                        </RowList>
                    </RowPanel>
                </PageSection>

                {/* ───────────── 3) Baner og tid ───────────── */}
                <PageSection
                    title="Baner og tid"
                    description="Velg hvilke baner og tidspunkter som skal reserveres."
                >
                    <RowPanel>
                        <RowList>
                            <SwitchRow
                                title="Velg alle baner"
                                checked={alleBaner}
                                onCheckedChange={onToggleAlleBaner}
                            />

                            <Row title="Baner" description="Velg hvilke baner arrangementet gjelder.">
                                <div className="flex flex-wrap gap-2">
                                    {baner.map((b) => (
                                        <Button
                                            key={b.id}
                                            type="button"
                                            variant={valgteBaner.includes(b.id) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onToggleBane(b.id)}
                                            disabled={alleBaner}
                                        >
                                            {b.navn}
                                        </Button>
                                    ))}
                                </div>
                            </Row>

                            <SwitchRow
                                title="Velg alle tidspunkter"
                                checked={alleTidspunkter}
                                onCheckedChange={onToggleAlleTidspunkter}
                            />

                            <Row title="Tidspunkter" description="Velg start-tidspunkt for bookingene.">
                                <div className="flex flex-wrap gap-2">
                                    {tilgjengeligeTidspunkter.map((tid) => (
                                        <Button
                                            key={tid}
                                            type="button"
                                            variant={valgteTidspunkter.includes(tid) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onToggleTidspunkt(tid)}
                                            disabled={alleTidspunkter}
                                        >
                                            {tid}
                                        </Button>
                                    ))}
                                </div>
                            </Row>
                        </RowList>


                    </RowPanel>
                </PageSection>

                <FormActions variant="sticky">
                    <FormSubmitButton
                        isLoading={isLoadingForhandsvisning}
                        loadingText="Forhåndsviser…"
                        fullWidth
                    >
                        Forhåndsvis bookinger
                    </FormSubmitButton>
                </FormActions>
            </FormLayout>

            <ForhandsvisningDialog
                open={dialogOpen}
                onOpenChange={onDialogOpenChange}
                baner={baner}
                beskrivelse={beskrivelse}
                forhandsvisning={forhandsvisning}
                isLoading={isLoadingForhandsvisning}
                onCreate={onCreate}
            />
        </>
    );
}
