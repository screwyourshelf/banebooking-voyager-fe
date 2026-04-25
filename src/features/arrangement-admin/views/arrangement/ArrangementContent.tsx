import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RowPanel, RowList, Row, SwitchRow } from "@/components/rows";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DatoVelger from "@/components/DatoVelger";
import ForhandsvisningDialog from "./ForhandsvisningDialog";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { TriangleAlert } from "lucide-react";

import type { ArrangementKategori, DayOfWeek, ArrangementForhåndsvisningRespons } from "@/types";
import type { BaneRespons, GrenRespons } from "@/types";
import { dayOfWeekKortNorsk } from "@/utils/datoUtils";
import type { SlotLengdeGruppe } from "./arrangementUtils";

type Props = {
  grener: GrenRespons[];
  valgtGrenId: string;
  onGrenChange: (grenId: string) => void;

  kategorier: readonly ArrangementKategori[];
  kategori: ArrangementKategori;
  beskrivelse: string;
  nettsideTittel: string;
  nettsideBeskrivelse: string;
  publisertPåNettsiden: boolean;

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
  onChangeNettsideTittel: (v: string) => void;
  onChangeNettsideBeskrivelse: (v: string) => void;
  onChangePublisertPåNettsiden: (v: boolean) => void;
  tillaterPaamelding: boolean;
  tillaterPaameldingDisabled?: boolean;
  onChangeTillaterPaamelding: (v: boolean) => void;
  onChangeDatoFra: (d: Date) => void;
  onChangeDatoTil: (d: Date) => void;

  onToggleAlleBaner: (v: boolean) => void;
  onToggleAlleUkedager: (v: boolean) => void;
  onToggleAlleTidspunkter: (v: boolean) => void;

  onToggleBane: (id: string) => void;
  onToggleUkedag: (dag: DayOfWeek) => void;
  onToggleTidspunkt: (tid: string) => void;

  tillaterTurnering?: boolean;
  tillaterTurneringDisabled?: boolean;
  onChangeTillaterTurnering?: (v: boolean) => void;
  onNavigerTilTurnering?: () => void;

  onOpenPreview: () => void;
  onCreate: () => void;
  onDialogOpenChange: (open: boolean) => void;
  bekreftTekst?: string;
  advarsel?: string;
  slotLengdeAdvarsel?: string;

  slotGrupper?: SlotLengdeGruppe[];
  tidspunkterPerGruppe?: Record<number, string[]>;
  allePerGruppe?: Record<number, boolean>;
  onToggleAlleForGruppe?: (slotLengde: number, v: boolean) => void;
  onToggleTidspunktForGruppe?: (slotLengde: number, tid: string) => void;
  serverFeil?: string | null;
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
    grener,
    valgtGrenId,
    onGrenChange,
    kategorier,
    kategori,
    beskrivelse,
    nettsideTittel,
    nettsideBeskrivelse,
    publisertPåNettsiden,

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
    onChangeNettsideTittel,
    onChangeNettsideBeskrivelse,
    onChangePublisertPåNettsiden,
    tillaterPaamelding,
    tillaterPaameldingDisabled,
    onChangeTillaterPaamelding,
    tillaterTurnering,
    tillaterTurneringDisabled,
    onChangeTillaterTurnering,
    onNavigerTilTurnering,
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
    slotLengdeAdvarsel,

    slotGrupper,
    tidspunkterPerGruppe,
    allePerGruppe,
    onToggleAlleForGruppe,
    onToggleTidspunktForGruppe,
    serverFeil,
  } = props;

  const erGruppert = slotGrupper && slotGrupper.length > 1;

  const typeSummary = kategori;

  const periodeSummary = [
    `${datoFra.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })} – ${datoTil.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}`,
    valgteUkedager.length > 0 ? valgteUkedager.map(dayOfWeekKortNorsk).join(", ") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const antallTidspunkter = erGruppert
    ? Object.values(tidspunkterPerGruppe ?? {}).reduce((s, t) => s + t.length, 0)
    : valgteTidspunkter.length;

  const banerOgTidSummary = [
    valgteBaner.length > 0
      ? `${valgteBaner.length} bane${valgteBaner.length !== 1 ? "r" : ""}`
      : null,
    antallTidspunkter > 0
      ? `${antallTidspunkter} tidspunkt${antallTidspunkter !== 1 ? "er" : ""}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <FormLayout
        onSubmit={(e) => {
          e.preventDefault();
          onOpenPreview();
        }}
      >
        <Accordion type="multiple" defaultValue={["type"]} className="space-y-2">
          <AccordionItem value="type" className="border-0 group">
            <section className="rounded-xl bg-gradient-to-b from-muted/60 via-muted/25 to-transparent py-1">
              <div className="px-2">
                <AccordionTrigger className="py-0 hover:no-underline items-center">
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold tracking-wider uppercase text-foreground/80">
                      Type
                    </span>
                    <span className="text-xs text-muted-foreground truncate group-data-[state=open]:hidden">
                      {typeSummary}
                    </span>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="pb-1">
                <div className="px-1 space-y-1 mt-3">
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

                      {grener.length > 1 && (
                        <Row title="Gren" description="Baner filtreres etter valgt gren.">
                          <Field>
                            <Select value={valgtGrenId} onValueChange={onGrenChange}>
                              <SelectTrigger id="gren">
                                <SelectValue placeholder="Velg gren..." />
                              </SelectTrigger>
                              <SelectContent>
                                {grener.map((g) => (
                                  <SelectItem key={g.id} value={g.id}>
                                    {g.navn}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                        </Row>
                      )}

                      <SwitchRow
                        title="Vis på nettsiden"
                        description="Publiserer arrangementet på klubbens hjemmeside med egen nettsidetekst."
                        checked={publisertPåNettsiden}
                        onCheckedChange={onChangePublisertPåNettsiden}
                      />

                      {publisertPåNettsiden ? (
                        <>
                          <Row title="Tittel for nettsiden">
                            <Field>
                              <Input
                                id="nettside-tittel"
                                value={nettsideTittel}
                                onChange={(e) => onChangeNettsideTittel(e.target.value)}
                                placeholder="F.eks. Vårturnering 2026"
                                maxLength={100}
                              />
                            </Field>
                          </Row>
                          <Row title="Beskrivelse for nettsiden">
                            <TiptapEditor
                              content={nettsideBeskrivelse}
                              onChange={onChangeNettsideBeskrivelse}
                            />
                          </Row>
                        </>
                      ) : (
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
                      )}

                      <SwitchRow
                        title="Enkel påmelding"
                        description="Lar medlemmer melde seg på arrangementet. Brukes for aktiviteter uten turneringsoppsett."
                        checked={tillaterPaamelding}
                        onCheckedChange={onChangeTillaterPaamelding}
                        disabled={tillaterPaameldingDisabled}
                      />
                      {onChangeTillaterTurnering !== undefined && (
                        <Row
                          title="Turneringsmodus"
                          description="Aktiverer turneringsfunksjoner som klasser, trekning og kampresultater. Påmelding brukes da til registrering av spillere i turneringen."
                          density="compact"
                          right={
                            <div className="flex items-center gap-3">
                              {onNavigerTilTurnering && tillaterTurnering && (
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={onNavigerTilTurnering}
                                >
                                  Gå til turnering
                                </Button>
                              )}
                              <Switch
                                checked={tillaterTurnering ?? false}
                                onCheckedChange={onChangeTillaterTurnering}
                                disabled={tillaterTurneringDisabled}
                              />
                            </div>
                          }
                        />
                      )}
                    </RowList>
                  </RowPanel>
                </div>
              </AccordionContent>
            </section>
          </AccordionItem>

          <AccordionItem value="periode" className="border-0 group">
            <section className="rounded-xl bg-gradient-to-b from-muted/60 via-muted/25 to-transparent py-1">
              <div className="px-2">
                <AccordionTrigger className="py-0 hover:no-underline items-center">
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold tracking-wider uppercase text-foreground/80">
                      Periode
                    </span>
                    <span className="text-xs text-muted-foreground truncate group-data-[state=open]:hidden">
                      {periodeSummary}
                    </span>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="pb-1">
                <div className="px-1 space-y-1 mt-3">
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
                        right={
                          <Switch checked={alleUkedager} onCheckedChange={onToggleAlleUkedager} />
                        }
                      >
                        <div className="flex flex-wrap gap-2">
                          {UKEDAGER_REKKEFOLGE.map((dag) => (
                            <Button
                              key={dag}
                              type="button"
                              aria-label="Ukedager"
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
                </div>
              </AccordionContent>
            </section>
          </AccordionItem>

          <AccordionItem value="baner-og-tid" className="border-0 group">
            <section className="rounded-xl bg-gradient-to-b from-muted/60 via-muted/25 to-transparent py-1">
              <div className="px-2">
                <AccordionTrigger className="py-0 hover:no-underline items-center">
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold tracking-wider uppercase text-foreground/80">
                      Baner og tid
                    </span>
                    <span className="text-xs text-muted-foreground truncate group-data-[state=open]:hidden">
                      {banerOgTidSummary}
                    </span>
                  </div>
                </AccordionTrigger>
              </div>
              <AccordionContent className="pb-1">
                <div className="px-1 space-y-1 mt-3">
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
                              aria-label="Baner"
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

                      {erGruppert ? (
                        <>
                          {slotGrupper!.map((gruppe) => {
                            const sl = gruppe.slotLengdeMinutter;
                            const valgte = tidspunkterPerGruppe?.[sl] ?? [];
                            const alle = allePerGruppe?.[sl] ?? false;

                            return (
                              <Row
                                key={sl}
                                title={`Tidspunkter – ${sl} min`}
                                description={gruppe.baneNavn.join(", ")}
                                right={
                                  <Switch
                                    checked={alle}
                                    onCheckedChange={(v) => onToggleAlleForGruppe?.(sl, v)}
                                  />
                                }
                              >
                                <div className="flex flex-wrap gap-2">
                                  {gruppe.tidspunkter.map((tid) => (
                                    <Button
                                      key={tid}
                                      type="button"
                                      aria-label="Tidspunkter"
                                      variant={valgte.includes(tid) ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => onToggleTidspunktForGruppe?.(sl, tid)}
                                      disabled={alle}
                                    >
                                      {tid}
                                    </Button>
                                  ))}
                                </div>
                              </Row>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          {slotLengdeAdvarsel && (
                            <div className="px-2 py-2">
                              <Alert className="border-amber-200 bg-amber-50 text-amber-700 [&>svg]:text-amber-700">
                                <TriangleAlert />
                                <AlertDescription>{slotLengdeAdvarsel}</AlertDescription>
                              </Alert>
                            </div>
                          )}

                          <Row
                            title="Tidspunkter"
                            right={
                              <Switch
                                checked={alleTidspunkter}
                                onCheckedChange={onToggleAlleTidspunkter}
                              />
                            }
                          >
                            <div className="flex flex-wrap gap-2">
                              {tilgjengeligeTidspunkter.map((tid) => (
                                <Button
                                  key={tid}
                                  type="button"
                                  aria-label="Tidspunkter"
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
                        </>
                      )}
                    </RowList>
                  </RowPanel>
                </div>
              </AccordionContent>
            </section>
          </AccordionItem>
        </Accordion>

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
        forhandsvisning={forhandsvisning}
        isLoading={isLoadingForhandsvisning}
        onCreate={onCreate}
        bekreftTekst={bekreftTekst}
        advarsel={advarsel}
        serverFeil={serverFeil}
      />
    </>
  );
}
