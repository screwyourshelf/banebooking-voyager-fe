import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { FormSkeleton } from "@/components/loading";
import { RowPanel, RowList, Row, SwitchRow } from "@/components/rows";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageSection from "@/components/sections/PageSection";
import TiptapEditor from "@/components/editor/TiptapEditor";

import { useArrangement } from "../../hooks/useArrangement";
import { useBookingListe } from "../../hooks/useBookingListe";
import { useKonfliktSjekk, mergeKonfliktStatus } from "../../hooks/useKonfliktSjekk";
import RedigerBookingModal from "../../components/RedigerBookingModal/RedigerBookingModal";
import type { RedigerBookingVerdier } from "../../components/RedigerBookingModal/RedigerBookingModal";
import GjentakendeOppsett from "../../components/GjentakendeOppsett/GjentakendeOppsett";
import ManueltOppsett from "../../components/ManueltOppsett/ManueltOppsett";
import BookingListe from "../../components/BookingListe/BookingListe";
import { byggKonfliktSjekkDto } from "./arrangementUtils";
import { lagBookingNøkkel } from "../../components/BookingListe/bookingListeUtils";
import type { LokalBooking } from "../../types";

import type { ArrangementKategori, DayOfWeek, OpprettArrangementForespørsel } from "@/types";

const KATEGORIER = [
  "Trening",
  "Turnering",
  "Klubbmersterskap",
  "Kurs",
  "Lagkamp",
  "Stigespill",
  "Dugnad",
  "Vedlikehold",
  "Sosialt",
  "Annet",
] as const satisfies readonly ArrangementKategori[];

export default function OpprettArrangementView() {
  const [valgtGrenId, setValgtGrenId] = useState("");

  const {
    grener,
    baner: alleBanerData,
    opprett,
    opprettFeil,
    isLoading,
  } = useArrangement(valgtGrenId);

  // Filtrer baner til valgt gren
  const baner = useMemo(
    () => (valgtGrenId ? alleBanerData.filter((b) => b.grenId === valgtGrenId) : alleBanerData),
    [alleBanerData, valgtGrenId]
  );

  // Pre-select gren (render-time adjust)
  if (!valgtGrenId && grener.length > 0) {
    setValgtGrenId(grener[0].id);
  }

  // Metadata
  const [kategori, setKategori] = useState<ArrangementKategori>("Annet");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [publisertPåNettsiden, setPublisertPåNettsiden] = useState(false);
  const [nettsideTittel, setNettsideTittel] = useState("");
  const [nettsideBeskrivelse, setNettsideBeskrivelse] = useState("");

  // Oppsettsmodus
  const [oppsettsModus, setOppsettsModus] = useState<"gjentakende" | "manuell">("gjentakende");

  // Aktiv tab
  const [aktivTab, setAktivTab] = useState<"metadata" | "bookinger">("metadata");

  // BookingListe
  const { bookinger, leggTil, fjern, markerSlettet, oppdater, settAlle } = useBookingListe();
  // Ref holder alltid siste liste – unngår stale closure i async-handler
  const bookingListeRef = useRef<LokalBooking[]>([]);
  useEffect(() => { bookingListeRef.current = bookinger; }, [bookinger]);

  // Konfliktsjekk (steg 2b)
  const { sjekkKonflikter, isLoading: sjekkKonflikterLoading } = useKonfliktSjekk();

  const håndterGrenEndring = (grenId: string) => {
    setValgtGrenId(grenId);
  };

  /**
   * Kalles av GjentakendeOppsett etter generering.
   * 1. Legg de nye bookingene i listen (deduplicering skjer i leggTil)
   * 2. Ta snapshot av hele listen via ref (unngår stale closure over async)
   * 3. Kall konfliktsjekk med snapshot + nye
   * 4. Merge status tilbake – API er kun brukt for å enriche, ikke erstatte listen
   */
  const håndterGenerer = async (nye: LokalBooking[]) => {
    leggTil(nye);

    // Snapshot: eksisterende bookinger fra ref + nye (de som faktisk ble lagt til)
    // Bruker ref for å unngå stale bookinger fra closure
    const snapshotFør = bookingListeRef.current;
    const eksisterendeNøkler = new Set(snapshotFør.map(lagBookingNøkkel));
    const unikNye = nye.filter((b) => !eksisterendeNøkler.has(lagBookingNøkkel(b)));
    const snapshot = [...snapshotFør, ...unikNye];

    if (snapshot.length === 0 || !valgtGrenId) return;

    const aktive = snapshot.filter((b) => !b.erSlettet);
    if (aktive.length === 0) return;

    const konfliktDto = byggKonfliktSjekkDto(aktive, valgtGrenId, kategori);
    if (!konfliktDto) return;

    const resultat = await sjekkKonflikter(snapshot, konfliktDto);
    if (resultat) {
      // settAlle erstatter listen med snapshot + merget status.
      // Eventuelle interaksjoner under API-kallet kan gå tapt – akseptert i v1.
      settAlle(resultat.oppdaterteBookinger);
    }
  };

  // Redigering av enkeltbooking
  const [redigeringsMålId, setRedigeringsMålId] = useState<string | null>(null);

  const håndterRediger = (id: string) => setRedigeringsMålId(id);

  const håndterRedigerBekreft = async (id: string, verdier: RedigerBookingVerdier) => {
    setRedigeringsMålId(null);
    oppdater(id, {
      dato: verdier.dato,
      startTid: verdier.startTid,
      sluttTid: verdier.sluttTid,
      baneId: verdier.baneId,
      baneNavn: verdier.baneNavn,
      status: "ukjent",
    });

    // Re-kjør konfliktsjekk på listen etter endringen
    const oppdatertListe = bookingListeRef.current.map((b) =>
      b.id === id
        ? { ...b, dato: verdier.dato, startTid: verdier.startTid, sluttTid: verdier.sluttTid,
            baneId: verdier.baneId, baneNavn: verdier.baneNavn, status: "ukjent" as const }
        : b
    );
    const aktive = oppdatertListe.filter((b) => !b.erSlettet);
    const konfliktDto = aktive.length > 0 && valgtGrenId
      ? byggKonfliktSjekkDto(aktive, valgtGrenId, kategori)
      : null;
    if (konfliktDto) {
      const resultat = await sjekkKonflikter(oppdatertListe, konfliktDto);
      if (resultat) settAlle(resultat.oppdaterteBookinger);
    }
  };

  const håndterFjernEllerAvlys = (id: string) => {
    const booking = bookinger.find((b) => b.id === id);
    if (!booking) return;
    if (booking.kilde === "eksisterende") {
      markerSlettet(id);
    } else {
      fjern(id);
    }
  };

  // Opprett-handler – bygger DTO direkte fra BookingListen og kaller API
  const håndterOpprett = async () => {
    const aktiveBookinger = bookinger.filter((b) => !b.erSlettet);

    if (aktiveBookinger.length === 0) {
      toast.warning("Legg til minst én booking før du oppretter arrangementet.");
      return;
    }

    // Utled ukedager og periode fra booking-datoene (brukes kun for metadata på arrangementet)
    const JS_DAY_TO_DOW: DayOfWeek[] = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ];
    const unikeUkedager: DayOfWeek[] = [
      ...new Set(aktiveBookinger.map((b) => JS_DAY_TO_DOW[new Date(b.dato + "T00:00:00").getDay()])),
    ];
    const datoer = aktiveBookinger.map((b) => b.dato).sort();

    // Minimal banegruppe for validering (backend bruker eksplisitteSlots til selve bookingen)
    const baneGrupper = [
      {
        baneIder: [...new Set(aktiveBookinger.map((b) => b.baneId))],
        tidspunkter: [...new Set(aktiveBookinger.map((b) => b.startTid))].sort(),
      },
    ];

    const dto: OpprettArrangementForespørsel = {
      grenId: valgtGrenId,
      tittel: kategori,
      kategori,
      startDato: datoer[0],
      sluttDato: datoer[datoer.length - 1],
      ukedager: unikeUkedager,
      baneGrupper,
      beskrivelse: beskrivelse?.trim() || undefined,
      publisertPåNettsiden,
      nettsideTittel: publisertPåNettsiden && nettsideTittel.trim() ? nettsideTittel.trim() : undefined,
      nettsideBeskrivelse: publisertPåNettsiden && nettsideBeskrivelse.trim() ? nettsideBeskrivelse.trim() : undefined,
      // Eksplisitte slots: ALLTID sendt, slik at backend oppretter nøyaktig de
      // bookingene brukeren har i listen – ikke et rekonstruert gjentakende mønster
      eksplisitteSlots: aktiveBookinger.map((b) => ({
        baneId: b.baneId,
        dato: b.dato,
        startTid: b.startTid,
        sluttTid: b.sluttTid,
      })),
    };

    try {
      const { result } = await opprett(dto);
      if (result.konflikter.length > 0) {
        // Merge opprettelse-konflikter tilbake i BookingListen
        settAlle(
          mergeKonfliktStatus(bookingListeRef.current, {
            ledige: [],
            konflikter: result.konflikter.map((k) => ({
              dato: k.dato,
              startTid: k.startTid,
              sluttTid: k.sluttTid,
              baneId: k.baneId,
              baneNavn: "",
            })),
          })
        );
      }
    } catch {
      // feil vises via opprettFeil
    }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-4">
      <Tabs
        value={aktivTab}
        onValueChange={(v) => setAktivTab(v as typeof aktivTab)}
        className="space-y-3"
      >
        <TabsList>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="bookinger">Bookinger</TabsTrigger>
        </TabsList>

        {/* ─── Tab: Metadata ─── */}
        <TabsContent value="metadata" className="space-y-0 mt-0">
          <PageSection>
            <div className="px-1 space-y-1 mt-2">
              <RowPanel>
                <RowList>
                  {grener.length > 1 && (
                    <Row title="Gren" description="Baner filtreres etter valgt gren.">
                      <Field>
                        <Select value={valgtGrenId} onValueChange={håndterGrenEndring}>
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

                  <Row title="Kategori">
                    <Field>
                      <Select
                        value={kategori}
                        onValueChange={(v) => setKategori(v as ArrangementKategori)}
                      >
                        <SelectTrigger id="kategori">
                          <SelectValue placeholder="Velg kategori..." />
                        </SelectTrigger>
                        <SelectContent>
                          {KATEGORIER.map((k) => (
                            <SelectItem key={k} value={k}>
                              {k}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </Row>

                  <SwitchRow
                    title="Vis på nettsiden"
                    description="Publiserer arrangementet på klubbens hjemmeside med egen nettsidetekst."
                    checked={publisertPåNettsiden}
                    onCheckedChange={setPublisertPåNettsiden}
                  />

                  {publisertPåNettsiden ? (
                    <>
                      <Row title="Tittel for nettsiden">
                        <Field>
                          <Input
                            id="nettside-tittel"
                            value={nettsideTittel}
                            onChange={(e) => setNettsideTittel(e.target.value)}
                            placeholder="F.eks. Vårturnering 2026"
                            maxLength={100}
                          />
                        </Field>
                      </Row>
                      <Row title="Beskrivelse for nettsiden">
                        <TiptapEditor
                          content={nettsideBeskrivelse}
                          onChange={setNettsideBeskrivelse}
                        />
                      </Row>
                    </>
                  ) : (
                    <Row title="Beskrivelse">
                      <Field>
                        <Textarea
                          id="beskrivelse"
                          value={beskrivelse}
                          onChange={(e) => setBeskrivelse(e.target.value)}
                          className="resize-none"
                        />
                      </Field>
                    </Row>
                  )}

                </RowList>
              </RowPanel>
            </div>
          </PageSection>
        </TabsContent>

        {/* ─── Tab: Bookinger ─── */}
        <TabsContent value="bookinger" className="space-y-4 mt-0">
          <PageSection title="Legg til bookinger">
            <div className="px-1 mt-3 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOppsettsModus("gjentakende")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    oppsettsModus === "gjentakende"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Gjentakende oppsett
                </button>
                <button
                  type="button"
                  onClick={() => setOppsettsModus("manuell")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    oppsettsModus === "manuell"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Manuelt oppsett
                </button>
              </div>

              {oppsettsModus === "gjentakende" ? (
                <GjentakendeOppsett baner={baner} onGenerer={håndterGenerer} />
              ) : (
                <ManueltOppsett baner={baner} onLeggTil={håndterGenerer} />
              )}
            </div>
          </PageSection>

          <PageSection title="Bookinger">
            <div className="px-1 mt-3">
              <BookingListe
                bookinger={bookinger}
                onRediger={håndterRediger}
                onFjernEllerAvlys={håndterFjernEllerAvlys}
              />
            </div>
          </PageSection>

          <FormLayout onSubmit={(e) => { e.preventDefault(); håndterOpprett(); }}>
            <FormActions variant="sticky">
              <FormSubmitButton
                isLoading={sjekkKonflikterLoading}
                loadingText="Sjekker konflikter…"
                fullWidth
                disabled={bookinger.filter((b) => !b.erSlettet).length === 0 || sjekkKonflikterLoading}
              >
                Opprett arrangement ({bookinger.filter((b) => !b.erSlettet).length} bookinger)
              </FormSubmitButton>
            </FormActions>
          </FormLayout>

          {opprettFeil && (
            <p className="text-sm text-destructive px-1">{opprettFeil.message}</p>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Rediger enkeltbooking (modal) ─── */}
      <RedigerBookingModal
        key={redigeringsMålId ?? "closed"}
        booking={redigeringsMålId !== null ? (bookinger.find((b) => b.id === redigeringsMålId) ?? null) : null}
        baner={baner}
        onBekreft={håndterRedigerBekreft}
        onAvbryt={() => setRedigeringsMålId(null)}
      />
    </div>
  );
}
