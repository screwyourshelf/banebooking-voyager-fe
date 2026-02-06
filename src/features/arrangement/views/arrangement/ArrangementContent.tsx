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

import type { ArrangementKategori } from "@/types";
import type { UkedagKortNorsk } from "@/types/dato";
import type { ArrangementForhandsvisningDto, BaneDto } from "../../types";

type Props = {
    kategorier: readonly ArrangementKategori[];
    kategori: ArrangementKategori;
    beskrivelse: string;

    datoFra: Date;
    datoTil: Date;

    baner: BaneDto[];
    tilgjengeligeUkedager: UkedagKortNorsk[];
    tilgjengeligeTidspunkter: string[];

    valgteBaner: string[];
    valgteUkedager: UkedagKortNorsk[];
    valgteTidspunkter: string[];

    alleBaner: boolean;
    alleUkedager: boolean;
    alleTidspunkter: boolean;

    dialogOpen: boolean;
    forhandsvisning: ArrangementForhandsvisningDto;
    isLoadingForhandsvisning: boolean;

    onChangeKategori: (v: ArrangementKategori) => void;
    onChangeBeskrivelse: (v: string) => void;
    onChangeDatoFra: (d: Date) => void;
    onChangeDatoTil: (d: Date) => void;

    onToggleAlleBaner: (v: boolean) => void;
    onToggleAlleUkedager: (v: boolean) => void;
    onToggleAlleTidspunkter: (v: boolean) => void;

    onToggleBane: (id: string) => void;
    onToggleUkedag: (dag: UkedagKortNorsk) => void;
    onToggleTidspunkt: (tid: string) => void;

    onOpenPreview: () => void;
    onCreate: () => void;
    onDialogOpenChange: (open: boolean) => void;
};

const ukedagKnappRekkefølge: readonly UkedagKortNorsk[] = [
    "Man",
    "Tir",
    "Ons",
    "Tor",
    "Fre",
    "Lør",
    "Søn",
];

export default function ArrangementContent(props: Props) {
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
                <PageSection title="Type" description="Kategori og beskrivelse for arrangementet.">
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

                            <Row title="Beskrivelse" description="Vises på bookingene.">
                                <Field>
                                    <Input
                                        id="beskrivelse"
                                        value={beskrivelse}
                                        onChange={(e) => onChangeBeskrivelse(e.target.value)}
                                    />
                                </Field>
                            </Row>
                        </RowList>
                    </RowPanel>
                </PageSection>

                <PageSection
                    title="Periode"
                    description="Velg dato-intervallet og hvilke ukedager som gjelder."
                >
                    <RowPanel>
                        <RowList>
                            <Row title="Fra" description="Startdato.">
                                <DatoVelger value={datoFra} onChange={onChangeDatoFra} visNavigering />
                            </Row>

                            <Row title="Til" description="Sluttdato.">
                                <DatoVelger value={datoTil} onChange={onChangeDatoTil} visNavigering />
                            </Row>

                            <SwitchRow
                                title="Alle gyldige dager"
                                description="Velger automatisk alle dager som finnes i perioden."
                                checked={alleUkedager}
                                onCheckedChange={onToggleAlleUkedager}
                            />

                            <Row title="Ukedager" description="Bare dager som finnes i perioden er aktive.">
                                <div className="flex flex-wrap gap-2">
                                    {ukedagKnappRekkefølge.map((dag) => (
                                        <Button
                                            key={dag}
                                            type="button"
                                            variant={valgteUkedager.includes(dag) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onToggleUkedag(dag)}
                                            disabled={alleUkedager || !tilgjengeligeUkedager.includes(dag)}
                                        >
                                            {dag}
                                        </Button>
                                    ))}
                                </div>
                            </Row>
                        </RowList>
                    </RowPanel>
                </PageSection>

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
                beskrivelse={beskrivelse}
                forhandsvisning={forhandsvisning}
                isLoading={isLoadingForhandsvisning}
                onCreate={onCreate}
            />
        </>
    );
}
