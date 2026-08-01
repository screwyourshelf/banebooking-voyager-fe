import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AdminFormActions,
  AdminFormSubmitButton,
  AdminPageLoading,
  AdminSettingsForm,
  SettingsPanel,
  SettingsRadioGroup,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsSwitchRow,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { TabsLazyMount } from "@/components/navigation/Tabs";
import { Button } from "@/components/ui/button";
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

export default function OpprettArrangementView({ onCreated }: { onCreated?: () => void }) {
  const [valgtGrenId, setValgtGrenId] = useState("");

  const {
    grener,
    baner: alleBanerData,
    opprett,
    opprettFeil,
    isCreating,
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
  useEffect(() => {
    bookingListeRef.current = bookinger;
  }, [bookinger]);

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
        ? {
            ...b,
            dato: verdier.dato,
            startTid: verdier.startTid,
            sluttTid: verdier.sluttTid,
            baneId: verdier.baneId,
            baneNavn: verdier.baneNavn,
            status: "ukjent" as const,
          }
        : b
    );
    const aktive = oppdatertListe.filter((b) => !b.erSlettet);
    const konfliktDto =
      aktive.length > 0 && valgtGrenId ? byggKonfliktSjekkDto(aktive, valgtGrenId, kategori) : null;
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
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const unikeUkedager: DayOfWeek[] = [
      ...new Set(
        aktiveBookinger.map((b) => JS_DAY_TO_DOW[new Date(b.dato + "T00:00:00").getDay()])
      ),
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
      nettsideTittel:
        publisertPåNettsiden && nettsideTittel.trim() ? nettsideTittel.trim() : undefined,
      nettsideBeskrivelse:
        publisertPåNettsiden && nettsideBeskrivelse.trim() ? nettsideBeskrivelse.trim() : undefined,
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
      if (result.antallOpprettet > 0) onCreated?.();
    } catch {
      // feil vises via opprettFeil
    }
  };

  if (isLoading) return <AdminPageLoading label="Laster arrangementeditor" />;

  return (
    <>
      <TabsLazyMount
        value={aktivTab}
        onValueChange={(value) => setAktivTab(value as typeof aktivTab)}
        variant="section"
        ariaLabel="Opprett arrangement"
        items={[
          {
            value: "metadata",
            label: "Informasjon",
            content: (
              <AdminSettingsForm
                onSubmit={(event) => {
                  event.preventDefault();
                  setAktivTab("bookinger");
                }}
              >
                <SettingsStack>
                  <SettingsSection
                    eyebrow="Steg 1"
                    title="Grunnlag"
                    description="Velg gren og kategori, og legg inn en intern beskrivelse."
                  >
                    <SettingsPanel>
                      {grener.length > 1 ? (
                        <SettingsRow title="Gren" description="Styrer hvilke baner du kan velge.">
                          <Field>
                            <Select value={valgtGrenId} onValueChange={håndterGrenEndring}>
                              <SelectTrigger id="gren">
                                <SelectValue placeholder="Velg gren…" />
                              </SelectTrigger>
                              <SelectContent>
                                {grener.map((gren) => (
                                  <SelectItem key={gren.id} value={gren.id}>
                                    {gren.navn}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                        </SettingsRow>
                      ) : null}

                      <SettingsRow title="Kategori">
                        <Field>
                          <Select
                            value={kategori}
                            onValueChange={(value) => setKategori(value as ArrangementKategori)}
                          >
                            <SelectTrigger id="kategori">
                              <SelectValue placeholder="Velg kategori…" />
                            </SelectTrigger>
                            <SelectContent>
                              {KATEGORIER.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </SettingsRow>

                      <SettingsRow
                        title="Intern beskrivelse"
                        description="Vises i Banebooking og kan endres senere."
                      >
                        <Field>
                          <Textarea
                            id="beskrivelse"
                            value={beskrivelse}
                            onChange={(event) => setBeskrivelse(event.target.value)}
                            placeholder="Kort beskrivelse av arrangementet"
                          />
                        </Field>
                      </SettingsRow>
                    </SettingsPanel>
                  </SettingsSection>

                  <SettingsSection
                    title="Publisering"
                    description="Bestem om arrangementet også skal presenteres på klubbens nettside."
                  >
                    <SettingsPanel>
                      <SettingsSwitchRow
                        title="Vis på nettsiden"
                        description="Publiser med en egen tittel og presentasjonstekst."
                        checked={publisertPåNettsiden}
                        onCheckedChange={setPublisertPåNettsiden}
                      />

                      {publisertPåNettsiden ? (
                        <>
                          <SettingsRow title="Tittel på nettsiden">
                            <Field>
                              <Input
                                id="nettside-tittel"
                                value={nettsideTittel}
                                onChange={(event) => setNettsideTittel(event.target.value)}
                                placeholder="F.eks. Vårturnering 2026"
                                maxLength={100}
                              />
                            </Field>
                          </SettingsRow>
                          <SettingsRow title="Presentasjon på nettsiden">
                            <TiptapEditor
                              content={nettsideBeskrivelse}
                              onChange={setNettsideBeskrivelse}
                            />
                          </SettingsRow>
                        </>
                      ) : null}
                    </SettingsPanel>
                  </SettingsSection>
                </SettingsStack>

                <AdminFormActions>
                  <Button type="submit">Neste: Bookinger</Button>
                </AdminFormActions>
              </AdminSettingsForm>
            ),
          },
          {
            value: "bookinger",
            label: "Bookinger",
            content: (
              <AdminSettingsForm
                onSubmit={(event) => {
                  event.preventDefault();
                  void håndterOpprett();
                }}
              >
                <SettingsStack>
                  <SettingsSection
                    eyebrow="Steg 2"
                    title="Velg oppsett"
                    description="Begge metodene legger konkrete forslag i den samme bookinglisten."
                  >
                    <SettingsPanel>
                      <SettingsRow title="Oppsettstype">
                        <SettingsRadioGroup
                          label="Oppsettstype"
                          options={[
                            { value: "gjentakende", label: "Gjentakende" },
                            { value: "manuell", label: "Manuelt" },
                          ]}
                          value={oppsettsModus}
                          onValueChange={(value) => setOppsettsModus(value as typeof oppsettsModus)}
                        />
                      </SettingsRow>
                    </SettingsPanel>
                  </SettingsSection>

                  <SettingsSection
                    title={oppsettsModus === "gjentakende" ? "Gjentakende tider" : "Manuelle tider"}
                    description={
                      oppsettsModus === "gjentakende"
                        ? "Velg periode, ukedager, baner og tidspunkter."
                        : "Velg konkrete datoer, baner og tidspunkter."
                    }
                  >
                    {oppsettsModus === "gjentakende" ? (
                      <GjentakendeOppsett baner={baner} onGenerer={håndterGenerer} />
                    ) : (
                      <ManueltOppsett baner={baner} onLeggTil={håndterGenerer} />
                    )}
                  </SettingsSection>

                  <BookingListe
                    bookinger={bookinger}
                    onRediger={håndterRediger}
                    onFjernEllerAvlys={håndterFjernEllerAvlys}
                  />
                </SettingsStack>

                <AdminFormActions>
                  <ServerFeil feil={opprettFeil?.message ?? null} />
                  <AdminFormSubmitButton
                    isLoading={isCreating || sjekkKonflikterLoading}
                    loadingText={isCreating ? "Oppretter…" : "Sjekker konflikter…"}
                    disabled={
                      bookinger.filter((booking) => !booking.erSlettet).length === 0 ||
                      isCreating ||
                      sjekkKonflikterLoading
                    }
                  >
                    Opprett arrangement ({bookinger.filter((booking) => !booking.erSlettet).length})
                  </AdminFormSubmitButton>
                </AdminFormActions>
              </AdminSettingsForm>
            ),
          },
        ]}
      />

      <RedigerBookingModal
        key={redigeringsMålId ?? "closed"}
        booking={
          redigeringsMålId !== null
            ? (bookinger.find((b) => b.id === redigeringsMålId) ?? null)
            : null
        }
        baner={baner}
        onBekreft={håndterRedigerBekreft}
        onAvbryt={() => setRedigeringsMålId(null)}
      />
    </>
  );
}
