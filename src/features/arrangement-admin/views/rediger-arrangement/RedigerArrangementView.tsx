import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { FormSkeleton } from "@/components/loading";
import { RowPanel, RowList, Row, SwitchRow } from "@/components/rows";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageSection from "@/components/sections/PageSection";
import TiptapEditor from "@/components/editor/TiptapEditor";

import { useNavigate } from "react-router-dom";

import { useSlug } from "@/hooks/useSlug";
import { useOpprettTurnering } from "@/features/turnering/hooks/turnering/useOpprettTurnering";

import { useRedigerArrangement } from "../../hooks/useRedigerArrangement";
import { useArrangementBookinger } from "../../hooks/useArrangementBookinger";
import { useOppdaterArrangementMetadata } from "../../hooks/useOppdaterArrangementMetadata";
import { useSlettArrangementBooking } from "../../hooks/useSlettArrangementBooking";
import { useLeggTilArrangementBooking } from "../../hooks/useLeggTilArrangementBooking";
import { useBookingListe } from "../../hooks/useBookingListe";
import { useKonfliktSjekk } from "../../hooks/useKonfliktSjekk";
import GjentakendeOppsett from "../../components/GjentakendeOppsett/GjentakendeOppsett";
import ManueltOppsett from "../../components/ManueltOppsett/ManueltOppsett";
import BookingListe from "../../components/BookingListe/BookingListe";
import { lagBookingNøkkel } from "../../components/BookingListe/bookingListeUtils";
import { byggKonfliktSjekkDto } from "../../views/arrangement/arrangementUtils";
import RedigerBookingModal from "../../components/RedigerBookingModal/RedigerBookingModal";
import type { RedigerBookingVerdier } from "../../components/RedigerBookingModal/RedigerBookingModal";
import type { LokalBooking } from "../../types";

import type { ArrangementKategori } from "@/types";

// ─── Hjelpefunksjoner ───────────────────────────────────────────────────────

function formatDatoKort(s: string): string {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

// ─── View ───────────────────────────────────────────────────────────────────

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

export default function RedigerArrangementView() {
  const [valgtId, setValgtId] = useState("");

  // useRedigerArrangement bruker valgtGrenId kun for tilgjengeligeTidspunkter (ikke relevant her)
  const {
    arrangementer,
    arrangement,
    baner: alleBanerData,
    isLoading,
    isLoadingArrangementer,
  } = useRedigerArrangement(valgtId || null, "");

  // Ekte bookinger fra backend
  const { bookinger: ekteBookinger, isLoading: isLoadingBookinger } = useArrangementBookinger(
    valgtId || null
  );

  // Baner filtrert på gren utledet fra arrangement
  const grenId = useMemo(() => {
    if (!arrangement) return "";
    const baneId = arrangement.baneGrupper[0]?.baneIder[0];
    if (!baneId) return "";
    return alleBanerData.find((b) => b.id === baneId)?.grenId ?? "";
  }, [arrangement, alleBanerData]);

  const baner = useMemo(
    () => (grenId ? alleBanerData.filter((b) => b.grenId === grenId) : alleBanerData),
    [alleBanerData, grenId]
  );

  // Metadata-state
  const [kategori, setKategori] = useState<ArrangementKategori>("Annet");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [publisertPåNettsiden, setPublisertPåNettsiden] = useState(false);
  const [nettsideTittel, setNettsideTittel] = useState("");
  const [nettsideBeskrivelse, setNettsideBeskrivelse] = useState("");

  // Oppsettsmodus (legge til nye bookinger)
  const [oppsettsModus, setOppsettsModus] = useState<"gjentakende" | "manuell">("gjentakende");

  // Aktiv tab
  const [aktivTab, setAktivTab] = useState<"metadata" | "bookinger">("metadata");

  // BookingListe-state
  const { bookinger, leggTil, fjern, oppdater, settAlle, nullstill } = useBookingListe();
  const { sjekkKonflikter } = useKonfliktSjekk();

  const {
    lagreMetadata,
    isLoading: lagreMetadataLoading,
    feil: lagreFeil,
  } = useOppdaterArrangementMetadata(valgtId);

  const slug = useSlug();
  const navigate = useNavigate();
  const opprettTurnering = useOpprettTurnering();

  const { slettBooking } = useSlettArrangementBooking(valgtId);
  const { leggTilBooking, batchLeggTil } = useLeggTilArrangementBooking(valgtId);
  const [oppretterForslag, setOppretterForslag] = useState(false);

  // Ref for å unngå stale closure i håndterGenererForslag
  const bookingListeRef = useRef<LokalBooking[]>([]);
  useEffect(() => {
    bookingListeRef.current = bookinger;
  }, [bookinger]);

  /**
   * stagingRef holder ikke-committede forslag (kilde !== "eksisterende") synkront.
   *
   * Hvorfor ref og ikke state:
   * Re-fetch-effekten under kjøres når `ekteBookinger` endres (etter DELETE/POST).
   * Den må vite hvilke staging-forslag som finnes på det tidspunktet for å bevare
   * dem gjennom re-fetch. En Effect for å sette staging-state ville ha en render
   * forsinkelse og kunne overskrive staging med [] før den nye verdien er satt.
   * Ref oppdateres synkront i render og leses korrekt av re-fetch-effekten.
   */
  const stagingRef = useRef<LokalBooking[]>([]);
  stagingRef.current = bookinger.filter((b) => b.kilde !== "eksisterende");

  // Populer BookingListe når ekte bookinger er lastet – bevar staged forslag
  useEffect(() => {
    if (isLoadingBookinger) return;
    settAlle([...ekteBookinger, ...stagingRef.current]);
  }, [ekteBookinger, isLoadingBookinger, settAlle]);

  // Nullstill BookingListe og reset tab når arrangement-valg endres
  const [prevValgtId, setPrevValgtId] = useState("");
  if (valgtId !== prevValgtId) {
    setPrevValgtId(valgtId);
    nullstill();
    setAktivTab("metadata");
  }

  // Pre-fyll metadata når arrangementet endres (render-time adjust)
  const [prevArrangementId, setPrevArrangementId] = useState<string | null>(null);
  const nyArrangementId = arrangement?.id ?? null;
  if (nyArrangementId !== prevArrangementId) {
    setPrevArrangementId(nyArrangementId);
    if (arrangement) {
      setKategori(arrangement.kategori);
      setBeskrivelse(arrangement.beskrivelse ?? "");
      setPublisertPåNettsiden(arrangement.publisertPåNettsiden);
      setNettsideTittel(arrangement.nettsideTittel ?? "");
      setNettsideBeskrivelse(arrangement.nettsideBeskrivelse ?? "");
    }
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  // Gjentakende oppsett: legg til som forslag i BookingListe (preview før commit)
  const håndterGenererForslag = async (nye: LokalBooking[]) => {
    leggTil(nye);

    const snapshot = bookingListeRef.current;
    const alleMedNye = [
      ...snapshot,
      ...nye.filter((n) => !snapshot.some((s) => lagBookingNøkkel(s) === lagBookingNøkkel(n))),
    ];

    const aktive = alleMedNye.filter((b) => !b.erSlettet);
    if (aktive.length === 0) return;

    const konfliktDto = byggKonfliktSjekkDto(aktive, grenId, kategori);
    if (!konfliktDto) return;

    const resultat = await sjekkKonflikter(alleMedNye, konfliktDto);
    if (resultat) {
      settAlle(resultat.oppdaterteBookinger);
    }
  };

  // Manuelt oppsett: legg til i staging + kjør konfliktsjekk (samme flow som gjentakende)
  const håndterManueltLeggTil = async (nye: LokalBooking[]) => {
    leggTil(nye);

    const snapshot = bookingListeRef.current;
    const alleMedNye = [
      ...snapshot,
      ...nye.filter((n) => !snapshot.some((s) => lagBookingNøkkel(s) === lagBookingNøkkel(n))),
    ];

    const aktive = alleMedNye.filter((b) => !b.erSlettet);
    if (aktive.length === 0) return;

    const konfliktDto = byggKonfliktSjekkDto(aktive, grenId, kategori);
    if (!konfliktDto) return;

    const resultat = await sjekkKonflikter(alleMedNye, konfliktDto);
    if (resultat) {
      settAlle(resultat.oppdaterteBookinger);
    }
  };

  // Staged forslag (fra gjentakende oppsett) – klar for commit
  const stagede = bookinger.filter(
    (b) => b.kilde !== "eksisterende" && !b.erSlettet && b.status !== "konflikt"
  );

  // Opprett alle staged forslag: POST sekvensielt via batch-kall.
  // Ved partial failure: behold kun feilede i staging, vis oppsummering.
  const håndterOpprettForslag = async () => {
    const snapshot = [...stagede];
    setOppretterForslag(true);
    try {
      const resultat = await batchLeggTil(
        snapshot.map((b) => ({
          lokalId: b.id,
          forespørsel: {
            baneId: b.baneId,
            dato: b.dato,
            startTid: b.startTid,
            sluttTid: b.sluttTid,
          },
        }))
      );

      // Fjern kun de som ble opprettet OK fra staging
      resultat.suksess.forEach((id) => fjern(id));

      // Oppdater feilede med feilmelding så de fortsatt vises i BookingListe
      if (resultat.feilet.length > 0) {
        const feiledeMeldinger = resultat.feilet
          .map((f) => f.feilmelding)
          .filter((v, i, arr) => arr.indexOf(v) === i) // unike meldinger
          .join(", ");
        toast.error(
          `${resultat.feilet.length} av ${snapshot.length} bookinger feilet: ${feiledeMeldinger}`
        );
      } else {
        toast.success(`${snapshot.length} bookinger opprettet.`);
      }
    } finally {
      setOppretterForslag(false);
    }
  };

  // Eksisterende: immediate DELETE + re-fetch. Lokal/staged: fjern fra state.
  const håndterFjernEllerAvlys = (id: string) => {
    const booking = bookinger.find((b) => b.id === id);
    if (!booking) return;
    if (booking.kilde === "eksisterende") {
      if (!booking.eksternId) return;
      void slettBooking(booking.eksternId);
    } else {
      fjern(id);
    }
  };

  // ─── Redigering av enkeltbooking ─────────────────────────────────────────

  const [redigeringsMålId, setRedigeringsMålId] = useState<string | null>(null);

  const håndterRediger = (id: string) => setRedigeringsMålId(id);

  const håndterRedigerBekreft = async (id: string, verdier: RedigerBookingVerdier) => {
    setRedigeringsMålId(null);
    const booking = bookinger.find((b) => b.id === id);
    if (!booking) return;

    if (booking.kilde === "eksisterende") {
      // DELETE gammel + POST ny – re-fetch håndterer oppdatering av listen
      if (!booking.eksternId) return;
      await slettBooking(booking.eksternId);
      await leggTilBooking({
        baneId: verdier.baneId,
        dato: verdier.dato,
        startTid: verdier.startTid,
        sluttTid: verdier.sluttTid,
      });
    } else {
      // Staging: oppdater lokalt + re-kjør konfliktsjekk
      oppdater(id, {
        dato: verdier.dato,
        startTid: verdier.startTid,
        sluttTid: verdier.sluttTid,
        baneId: verdier.baneId,
        baneNavn: verdier.baneNavn,
        status: "ukjent",
      });

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
        aktive.length > 0 && grenId ? byggKonfliktSjekkDto(aktive, grenId, kategori) : null;
      if (konfliktDto) {
        const resultat = await sjekkKonflikter(oppdatertListe, konfliktDto);
        if (resultat) settAlle(resultat.oppdaterteBookinger);
      }
    }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="space-y-4">
      {/* ─── Velg arrangement ─── */}
      <PageSection title="Arrangement">
        <div className="px-1 mt-3">
          <RowPanel>
            <RowList>
              <Row title="Velg arrangement">
                <Field>
                  <Select
                    value={valgtId}
                    onValueChange={setValgtId}
                    disabled={isLoadingArrangementer}
                  >
                    <SelectTrigger id="velg-arrangement">
                      <SelectValue
                        placeholder={
                          isLoadingArrangementer ? "Henter arrangementer…" : "Velg arrangement…"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const aktive = arrangementer?.filter((a) => !a.erPassert) ?? [];
                        const passerte = arrangementer?.filter((a) => a.erPassert) ?? [];
                        return (
                          <>
                            {aktive.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Aktive og kommende</SelectLabel>
                                {aktive.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.tittel} — {formatDatoKort(a.startDato)} –{" "}
                                    {formatDatoKort(a.sluttDato)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                            {aktive.length > 0 && passerte.length > 0 && <SelectSeparator />}
                            {passerte.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Passerte</SelectLabel>
                                {passerte.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.tittel} — {formatDatoKort(a.startDato)} –{" "}
                                    {formatDatoKort(a.sluttDato)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                          </>
                        );
                      })()}
                    </SelectContent>
                  </Select>
                </Field>
              </Row>
            </RowList>
          </RowPanel>
        </div>
      </PageSection>

      {arrangement && (
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
          <TabsContent value="metadata" className="space-y-4 mt-0">
            <PageSection>
              <div className="px-1 space-y-1 mt-2">
                <RowPanel>
                  <RowList>
                    <Row title="Kategori">
                      <Field>
                        <Select
                          value={kategori}
                          onValueChange={(v) => setKategori(v as ArrangementKategori)}
                        >
                          <SelectTrigger id="kategori">
                            <SelectValue placeholder="Velg kategori…" />
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

                {/* Metadata lagres via PATCH /arrangement/{id}/metadata – berører ikke bookinger */}
                <div className="px-1 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      lagreMetadata({
                        kategori,
                        beskrivelse: beskrivelse || undefined,
                        publisertPåNettsiden,
                        nettsideTittel:
                          publisertPåNettsiden && nettsideTittel.trim()
                            ? nettsideTittel.trim()
                            : undefined,
                        nettsideBeskrivelse:
                          publisertPåNettsiden && nettsideBeskrivelse.trim()
                            ? nettsideBeskrivelse.trim()
                            : undefined,
                      })
                    }
                    disabled={lagreMetadataLoading}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    {lagreMetadataLoading ? "Lagrer…" : "Lagre metadata"}
                  </button>
                  {lagreFeil && (
                    <p className="text-xs text-destructive mt-1">{lagreFeil.message}</p>
                  )}
                </div>
              </div>
            </PageSection>

            {/* ─── Turnering ─── */}
            <PageSection title="Turnering">
              <div className="px-1 mt-3">
                <RowPanel>
                  <RowList>
                    <Row title="Turneringsmodus">
                      {arrangement.turneringId ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/${slug}/turnering/${arrangement.turneringId}`)}
                          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
                        >
                          Administrer turnering
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => opprettTurnering.mutate({ arrangementId: arrangement.id })}
                          disabled={opprettTurnering.isPending}
                          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-50"
                        >
                          {opprettTurnering.isPending ? "Oppretter…" : "Opprett turnering"}
                        </button>
                      )}
                    </Row>
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
                  <GjentakendeOppsett baner={baner} onGenerer={håndterGenererForslag} />
                ) : (
                  <ManueltOppsett baner={baner} onLeggTil={håndterManueltLeggTil} />
                )}
              </div>
            </PageSection>

            <PageSection title="Bookinger">
              <div className="px-1 mt-3 space-y-2">
                <BookingListe
                  bookinger={bookinger}
                  onRediger={håndterRediger}
                  onFjernEllerAvlys={håndterFjernEllerAvlys}
                />
                {stagede.length > 0 && (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={håndterOpprettForslag}
                      disabled={oppretterForslag}
                      className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                    >
                      {oppretterForslag
                        ? `Oppretter ${stagede.length} forslag…`
                        : `Opprett ${stagede.length} forslag`}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Forslagene skrives ikke til backend før du bekrefter.
                    </p>
                  </div>
                )}
              </div>
            </PageSection>
          </TabsContent>
        </Tabs>
      )}

      {/* ─── Rediger enkeltbooking (modal) ─── */}
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
    </div>
  );
}
