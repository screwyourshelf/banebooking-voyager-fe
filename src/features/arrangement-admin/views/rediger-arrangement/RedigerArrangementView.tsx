import { useEffect, useMemo, useRef, useState } from "react";

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
  SettingsText,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { ActionFeedback, type ActionFeedbackMessage } from "@/components/feedback";
import { TabsLazyMount } from "@/components/navigation/Tabs";
import { RecordCollectionSkeleton, RecordListState, RecordStatus } from "@/components/records";
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
import LazyTiptapEditor from "@/components/editor/LazyTiptapEditor";
import {
  ARRANGEMENT_KATEGORI_VALG,
  formaterAntallBanetider,
} from "@/utils/arrangementPresentation";

import { useNavigate } from "react-router-dom";

import { useOpprettTurnering } from "@/features/turnering/hooks/turnering/useOpprettTurnering";

import { useRedigerArrangement } from "../../hooks/useRedigerArrangement";
import { useArrangementBookinger } from "../../hooks/useArrangementBookinger";
import { useOppdaterArrangementMetadata } from "../../hooks/useOppdaterArrangementMetadata";
import { useSlettArrangementBooking } from "../../hooks/useSlettArrangementBooking";
import { useLeggTilArrangementBooking } from "../../hooks/useLeggTilArrangementBooking";
import { useAvlysArrangement } from "../../hooks/useAvlysArrangement";
import { SlettArrangementDialog } from "../../components";
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

export default function RedigerArrangementView({
  arrangementId,
  onDeleted,
}: {
  arrangementId: string;
  onDeleted?: () => void;
}) {
  const valgtId = arrangementId;
  const [valgtGrenId, setValgtGrenId] = useState("");

  const {
    arrangement,
    grener,
    baner: alleBanerData,
    isLoading,
    isLoadingArrangementer,
  } = useRedigerArrangement(valgtId || null, valgtGrenId);

  // Ekte bookinger fra backend
  const {
    bookinger: ekteBookinger,
    isLoading: isLoadingBookinger,
    feil: bookingerFeil,
  } = useArrangementBookinger(valgtId || null);

  const baner = useMemo(
    () => (valgtGrenId ? alleBanerData.filter((b) => b.grenId === valgtGrenId) : alleBanerData),
    [alleBanerData, valgtGrenId]
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
    lagret: metadataLagret,
    resetTilbakemelding: resetMetadataFeedback,
  } = useOppdaterArrangementMetadata(valgtId);

  const navigate = useNavigate();
  const opprettTurnering = useOpprettTurnering();

  const { slettBooking, feil: slettBookingFeil } = useSlettArrangementBooking(valgtId);
  const {
    leggTilBooking,
    batchLeggTil,
    feil: leggTilBookingFeil,
  } = useLeggTilArrangementBooking(valgtId);
  const { avlys: avlysArrangement } = useAvlysArrangement(valgtId);
  const [oppretterForslag, setOppretterForslag] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState<ActionFeedbackMessage | null>(null);

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
  // eslint-disable-next-line react-hooks/refs -- bevisst render-time sync: ref leses synkront av re-fetch-effekten
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
      const baneId = arrangement.baneGrupper[0]?.baneIder[0];
      const derivertGrenId = baneId
        ? (alleBanerData.find((b) => b.id === baneId)?.grenId ?? "")
        : "";
      if (derivertGrenId) setValgtGrenId(derivertGrenId);
    }
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  // Gjentakende oppsett: legg til som forslag i BookingListe (preview før commit)
  const håndterGenererForslag = async (nye: LokalBooking[]) => {
    setBookingFeedback(null);
    leggTil(nye);

    const snapshot = bookingListeRef.current;
    const alleMedNye = [
      ...snapshot,
      ...nye.filter((n) => !snapshot.some((s) => lagBookingNøkkel(s) === lagBookingNøkkel(n))),
    ];

    const aktive = alleMedNye.filter((b) => !b.erSlettet);
    if (aktive.length === 0) return;

    const konfliktDto = byggKonfliktSjekkDto(aktive, valgtGrenId, kategori);
    if (!konfliktDto) return;

    const resultat = await sjekkKonflikter(alleMedNye, konfliktDto);
    if (resultat) {
      settAlle(resultat.oppdaterteBookinger);
    }
  };

  // Manuelt oppsett: legg til i staging + kjør konfliktsjekk (samme flow som gjentakende)
  const håndterManueltLeggTil = async (nye: LokalBooking[]) => {
    setBookingFeedback(null);
    leggTil(nye);

    const snapshot = bookingListeRef.current;
    const alleMedNye = [
      ...snapshot,
      ...nye.filter((n) => !snapshot.some((s) => lagBookingNøkkel(s) === lagBookingNøkkel(n))),
    ];

    const aktive = alleMedNye.filter((b) => !b.erSlettet);
    if (aktive.length === 0) return;

    const konfliktDto = byggKonfliktSjekkDto(aktive, valgtGrenId, kategori);
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
    setBookingFeedback(null);
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
        setBookingFeedback({
          tone: "warning",
          title: `${resultat.feilet.length} av ${snapshot.length} banetider kunne ikke opprettes`,
          description: feiledeMeldinger,
        });
      } else {
        setBookingFeedback({
          tone: "success",
          title: `${formaterAntallBanetider(snapshot.length)} ble opprettet`,
          description: "De nye tidene vises nå i listen.",
        });
      }
    } catch (error) {
      setBookingFeedback({
        tone: "danger",
        title: "Banetidene kunne ikke opprettes",
        description: error instanceof Error ? error.message : "Prøv igjen om litt.",
      });
    } finally {
      setOppretterForslag(false);
    }
  };

  // Eksisterende: immediate DELETE + re-fetch. Lokal/staged: fjern fra state.
  const håndterFjernEllerAvlys = (id: string) => {
    setBookingFeedback(null);
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
    setBookingFeedback(null);
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
        aktive.length > 0 && valgtGrenId
          ? byggKonfliktSjekkDto(aktive, valgtGrenId, kategori)
          : null;
      if (konfliktDto) {
        const resultat = await sjekkKonflikter(oppdatertListe, konfliktDto);
        if (resultat) settAlle(resultat.oppdaterteBookinger);
      }
    }
  };

  const håndterLagreMetadata = async () => {
    try {
      await lagreMetadata({
        kategori,
        beskrivelse: beskrivelse || undefined,
        publisertPåNettsiden,
        nettsideTittel:
          publisertPåNettsiden && nettsideTittel.trim() ? nettsideTittel.trim() : undefined,
        nettsideBeskrivelse:
          publisertPåNettsiden && nettsideBeskrivelse.trim()
            ? nettsideBeskrivelse.trim()
            : undefined,
      });
    } catch {
      // Feilen vises i skjemaets felles feilflate.
    }
  };

  if (isLoading || isLoadingArrangementer || !arrangement) {
    return <AdminPageLoading label="Laster arrangementskjemaet" />;
  }

  return (
    <>
      <TabsLazyMount
        value={aktivTab}
        onValueChange={(value) => setAktivTab(value as typeof aktivTab)}
        variant="section"
        ariaLabel="Rediger arrangement"
        items={[
          {
            value: "metadata",
            label: "Informasjon",
            content: (
              <AdminSettingsForm
                onSubmit={(event) => {
                  event.preventDefault();
                  void håndterLagreMetadata();
                }}
              >
                <SettingsStack>
                  <SettingsSection
                    title="Arrangement"
                    description="Informasjonen kan lagres uten å endre banetidene."
                  >
                    <SettingsPanel>
                      {grener.length > 1 ? (
                        <SettingsRow
                          title="Gren for nye banetider"
                          description="Endrer bare hvilke baner du kan legge til videre."
                        >
                          <Field>
                            <Select value={valgtGrenId} onValueChange={setValgtGrenId}>
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
                            onValueChange={(value) => {
                              resetMetadataFeedback();
                              setKategori(value as ArrangementKategori);
                            }}
                          >
                            <SelectTrigger id="kategori">
                              <SelectValue placeholder="Velg kategori…" />
                            </SelectTrigger>
                            <SelectContent>
                              {ARRANGEMENT_KATEGORI_VALG.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </SettingsRow>

                      <SettingsRow title="Intern beskrivelse">
                        <Field>
                          <Textarea
                            id="beskrivelse"
                            value={beskrivelse}
                            onChange={(event) => {
                              resetMetadataFeedback();
                              setBeskrivelse(event.target.value);
                            }}
                          />
                        </Field>
                      </SettingsRow>
                    </SettingsPanel>
                  </SettingsSection>

                  <SettingsSection
                    title="Publisering"
                    description="Styr presentasjonen på klubbens nettside."
                  >
                    <SettingsPanel>
                      <SettingsSwitchRow
                        title="Vis på nettsiden"
                        description="Publiser med egen tittel og presentasjonstekst."
                        checked={publisertPåNettsiden}
                        onCheckedChange={(checked) => {
                          resetMetadataFeedback();
                          setPublisertPåNettsiden(checked);
                        }}
                      />

                      {publisertPåNettsiden ? (
                        <>
                          <SettingsRow title="Tittel på nettsiden">
                            <Field>
                              <Input
                                id="nettside-tittel"
                                value={nettsideTittel}
                                onChange={(event) => {
                                  resetMetadataFeedback();
                                  setNettsideTittel(event.target.value);
                                }}
                                placeholder="F.eks. Vårturnering 2026"
                                maxLength={100}
                              />
                            </Field>
                          </SettingsRow>
                          <SettingsRow title="Presentasjon på nettsiden">
                            <LazyTiptapEditor
                              content={nettsideBeskrivelse}
                              onChange={(content) => {
                                resetMetadataFeedback();
                                setNettsideBeskrivelse(content);
                              }}
                            />
                          </SettingsRow>
                        </>
                      ) : null}
                    </SettingsPanel>
                  </SettingsSection>

                  <SettingsSection
                    title="Turnering"
                    description="Koble arrangementet til turneringsadministrasjon ved behov."
                  >
                    <SettingsPanel>
                      <SettingsRow
                        title="Turneringsmodus"
                        description={
                          arrangement.turneringId
                            ? "Arrangementet er koblet til en turnering."
                            : "Opprett en turnering med arrangementet som grunnlag."
                        }
                      >
                        {arrangement.turneringId ? (
                          <Button
                            type="button"
                            onClick={() => navigate(`../turnering/${arrangement.turneringId}`)}
                          >
                            Administrer turnering
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              opprettTurnering.mutate({ arrangementId: arrangement.id })
                            }
                            disabled={opprettTurnering.isPending}
                          >
                            {opprettTurnering.isPending ? "Oppretter…" : "Opprett turnering"}
                          </Button>
                        )}
                      </SettingsRow>
                    </SettingsPanel>
                    <ServerFeil feil={opprettTurnering.error?.message ?? null} />
                  </SettingsSection>

                  <SettingsSection
                    eyebrow="Fareområde"
                    title="Avlys arrangement"
                    description="Alle tilknyttede banetider slettes. Handlingen må bekreftes."
                    tone="danger"
                  >
                    <SettingsPanel>
                      <SettingsRow title="Hele arrangementet">
                        <SettingsText>
                          Bruk avlysning bare når arrangementet og alle tidene skal fjernes.
                        </SettingsText>
                      </SettingsRow>
                    </SettingsPanel>
                    <AdminFormActions>
                      <SlettArrangementDialog
                        tittel={arrangement.tittel}
                        harTurnering={!!arrangement.turneringId}
                        onSlett={async () => {
                          await avlysArrangement();
                          onDeleted?.();
                        }}
                        trigger={<Button variant="destructive">Avlys arrangement</Button>}
                      />
                    </AdminFormActions>
                  </SettingsSection>
                </SettingsStack>

                <AdminFormActions>
                  {metadataLagret ? (
                    <ActionFeedback
                      tone="success"
                      title="Informasjonen er lagret"
                      description="Arrangementoversikten er oppdatert."
                    />
                  ) : null}
                  <ServerFeil feil={lagreFeil?.message ?? null} />
                  <AdminFormSubmitButton isLoading={lagreMetadataLoading} loadingText="Lagrer…">
                    Lagre informasjon
                  </AdminFormSubmitButton>
                </AdminFormActions>
              </AdminSettingsForm>
            ),
          },
          {
            value: "bookinger",
            label: "Tider",
            content: (
              <SettingsStack>
                <SettingsSection
                  title="Legg til banetider"
                  description="Nye tider legges først som forslag og lagres separat."
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
                    <GjentakendeOppsett baner={baner} onGenerer={håndterGenererForslag} />
                  ) : (
                    <ManueltOppsett baner={baner} onLeggTil={håndterManueltLeggTil} />
                  )}
                </SettingsSection>

                {isLoadingBookinger ? (
                  <RecordCollectionSkeleton
                    ariaLabel="Laster arrangementets banetider"
                    rows={5}
                    layout="date"
                  />
                ) : bookingerFeil ? (
                  <RecordListState
                    title="Kunne ikke laste banetidene"
                    description={bookingerFeil.message}
                    tone="danger"
                    role="alert"
                  />
                ) : (
                  <BookingListe
                    bookinger={bookinger}
                    onRediger={håndterRediger}
                    onFjernEllerAvlys={håndterFjernEllerAvlys}
                  />
                )}

                {bookingFeedback ? <ActionFeedback {...bookingFeedback} /> : null}
                <ServerFeil
                  feil={slettBookingFeil?.message ?? leggTilBookingFeil?.message ?? null}
                  title="Listen over banetider kunne ikke oppdateres"
                />

                {stagede.length > 0 ? (
                  <SettingsSection
                    title="Forslag klare"
                    description="Forslagene lagres først når du bekrefter."
                  >
                    <SettingsPanel>
                      <SettingsRow title="Ulagrede tider">
                        <RecordStatus tone="event">{stagede.length} forslag</RecordStatus>
                      </SettingsRow>
                    </SettingsPanel>
                    <AdminFormActions>
                      <Button
                        type="button"
                        onClick={() => void håndterOpprettForslag()}
                        disabled={oppretterForslag}
                      >
                        {oppretterForslag
                          ? `Oppretter ${stagede.length}…`
                          : `Opprett ${stagede.length} forslag`}
                      </Button>
                    </AdminFormActions>
                  </SettingsSection>
                ) : null}
              </SettingsStack>
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
