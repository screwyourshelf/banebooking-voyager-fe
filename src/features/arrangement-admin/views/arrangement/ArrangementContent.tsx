import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row, SwitchRow } from "@/components/rows";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DatoVelger from "@/components/DatoVelger";
import ForhandsvisningDialog from "./ForhandsvisningDialog";

import type { ArrangementKategori, DayOfWeek, ArrangementForhåndsvisningRespons } from "@/types";
import type { BaneRespons } from "@/types";
import { dayOfWeekKortNorsk } from "@/utils/datoUtils";

type Props = {
  kategorier: readonly ArrangementKategori[];
  kategori: ArrangementKategori;
  beskrivelse: string;

  datoFra: Date;
  datoTil: Date;

  baner: BaneRespons[];
  tilgjengeligeUkedager: DayOfWeek[];
  tilgjengeligeTidspunkter: string[];

  valgteBaner: string[];
  valgteUkedager: DayOfWeek[];
  valgteTidspunkter: string[];

  alleBaner: boolean;
  alleUkedager: boolean;
  alleTidspunkter: boolean;

  dialogOpen: boolean;
  forhandsvisning: ArrangementForhåndsvisningRespons;
  isLoadingForhandsvisning: boolean;

  onChangeKategori: (v: ArrangementKategori) => void;
  onChangeBeskrivelse: (v: string) => void;
  tillaterPaamelding: boolean;
  onChangeTillaterPaamelding: (v: boolean) => void;
  onChangeDatoFra: (d: Date) => void;
  onChangeDatoTil: (d: Date) => void;

  onToggleAlleBaner: (v: boolean) => void;
  onToggleAlleUkedager: (v: boolean) => void;
  onToggleAlleTidspunkter: (v: boolean) => void;

  onToggleBane: (id: string) => void;
  onToggleUkedag: (dag: DayOfWeek) => void;
  onToggleTidspunkt: (tid: string) => void;

  onOpenPreview: () => void;
  onCreate: () => void;
  onDialogOpenChange: (open: boolean) => void;
  bekreftTekst?: string;
  advarsel?: string;
};

const UKEDAGER_REKKEFOLGE: readonly DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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
    tillaterPaamelding,
    onChangeTillaterPaamelding,
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
    bekreftTekst,
    advarsel,
  } = props;

  return (
    <>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          onOpenPreview();
        }}
      >
        <PageSection title="Type">
          <RowPanel>
            <RowList>
              <Row title="Kategori">
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

              <Row title="Beskrivelse">
                <Field>
                  <Textarea
                    id="beskrivelse"
                    value={beskrivelse}
                    onChange={(e) => onChangeBeskrivelse(e.target.value)}
                    className="resize-none"
                  />
                </Field>
              </Row>

              <SwitchRow
                title="Tillat påmelding"
                description="Lar medlemmer melde seg på arrangementet."
                checked={tillaterPaamelding}
                onCheckedChange={onChangeTillaterPaamelding}
              />
            </RowList>
          </RowPanel>
        </PageSection>

        <PageSection title="Periode">
          <RowPanel>
            <RowList>
              <Row title="Fra">
                <DatoVelger value={datoFra} onChange={onChangeDatoFra} visNavigering />
              </Row>

              <Row title="Til">
                <DatoVelger value={datoTil} onChange={onChangeDatoTil} visNavigering />
              </Row>

              <Row
                title="Ukedager"
                right={<Switch checked={alleUkedager} onCheckedChange={onToggleAlleUkedager} />}
              >
                <div className="flex flex-wrap gap-2">
                  {UKEDAGER_REKKEFOLGE.map((dag) => (
                    <Button
                      key={dag}
                      type="button"
                      variant={valgteUkedager.includes(dag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggleUkedag(dag)}
                      disabled={alleUkedager || !tilgjengeligeUkedager.includes(dag)}
                    >
                      {dayOfWeekKortNorsk(dag)}
                    </Button>
                  ))}
                </div>
              </Row>
            </RowList>
          </RowPanel>
        </PageSection>

        <PageSection title="Baner og tid">
          <RowPanel>
            <RowList>
              <Row
                title="Baner"
                right={<Switch checked={alleBaner} onCheckedChange={onToggleAlleBaner} />}
              >
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

              <Row
                title="Tidspunkter"
                right={
                  <Switch checked={alleTidspunkter} onCheckedChange={onToggleAlleTidspunkter} />
                }
              >
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
        bekreftTekst={bekreftTekst}
        advarsel={advarsel}
      />
    </>
  );
}
