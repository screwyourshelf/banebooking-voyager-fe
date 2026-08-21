import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Settings, Page } from "@/components";

import { ServerFeil } from "@/components/errors";
import { ActionFeedback, type ActionFeedbackMessage } from "@/components/feedback";
import { Button } from "@/components/ui/button";
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

import { useArrangement } from "../../hooks/useArrangement";
import { useBookingListe } from "../../hooks/useBookingListe";
import { useKonfliktSjekk, mergeKonfliktStatus } from "../../hooks/useKonfliktSjekk";
import RedigerBookingModal from "../../components/RedigerBookingModal/RedigerBookingModal";
import type { RedigerBookingVerdier } from "../../components/RedigerBookingModal/RedigerBookingModal";
import GjentakendeOppsett from "../../components/GjentakendeOppsett/GjentakendeOppsett";
import ManueltOppsett from "../../components/ManueltOppsett/ManueltOppsett";
import BookingListe from "../../components/BookingListe/BookingListe";
import { byggKonfliktSjekkDto } from "./arrangementUtils";
import {
  kanBookingOpprettes,
  lagBookingNøkkel,
} from "../../components/BookingListe/bookingListeUtils";
import type { LokalBooking } from "../../types";

import type { ArrangementKategori, DayOfWeek, OpprettArrangementForespørsel } from "@/types";

type Props = {
  onCreated?: (feedback: ActionFeedbackMessage) => void;
};

export default function OpprettArrangementView({ onCreated }: Props) {
  const [valgtGrenId, setValgtGrenId] = useState("");
  const [opprettFeedback, setOpprettFeedback] = useState<ActionFeedbackMessage | null>(null);

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
    setOpprettFeedback(null);
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
    setOpprettFeedback(null);
    const booking = bookinger.find((b) => b.id === id);
    if (!booking) return;
    if (booking.kilde === "eksisterende") {
      markerSlettet(id);
    } else {
      fjern(id);
    }
  };

  const aktiveBookinger = bookinger.filter((booking) => !booking.erSlettet);
  const opprettbareBookinger = aktiveBookinger.filter(kanBookingOpprettes);
  const antallKjenteKonflikter = aktiveBookinger.length - opprettbareBookinger.length;

  // Opprett-handler – bygger DTO direkte fra BookingListen og kaller API
  const håndterOpprett = async () => {
    if (aktiveBookinger.length === 0) {
      setOpprettFeedback({
        tone: "warning",
        title: "Arrangementet mangler banetider",
        description: "Legg til minst én banetid før du oppretter arrangementet.",
      });
      return;
    }

    if (opprettbareBookinger.length === 0) {
      setOpprettFeedback({
        tone: "warning",
        title: "Ingen ledige tider",
        description: "Rediger eller fjern konfliktene før arrangementet opprettes.",
      });
      return;
    }

    setOpprettFeedback(null);

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
        opprettbareBookinger.map((b) => JS_DAY_TO_DOW[new Date(b.dato + "T00:00:00").getDay()])
      ),
    ];
    const datoer = opprettbareBookinger.map((b) => b.dato).sort();

    // Minimal banegruppe for validering (backend bruker eksplisitteSlots til selve bookingen)
    const baneGrupper = [
      {
        baneIder: [...new Set(opprettbareBookinger.map((b) => b.baneId))],
        tidspunkter: [...new Set(opprettbareBookinger.map((b) => b.startTid))].sort(),
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
      // Kjente konflikter sendes ikke på nytt. Backend kontrollerer fortsatt de
      // opprettbare forslagene i tilfelle tilgjengeligheten har endret seg.
      eksplisitteSlots: opprettbareBookinger.map((b) => ({
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
      if (result.antallOpprettet === 0) {
        setOpprettFeedback({
          tone: "warning",
          title: "Ingen banetider ble opprettet",
          description:
            "Alle valgte tidspunkter var allerede opptatt. Juster forslagene og prøv igjen.",
        });
        return;
      }

      const konfliktAntall = antallKjenteKonflikter + result.konflikter.length;
      onCreated?.({
        tone: konfliktAntall > 0 ? "warning" : "success",
        title: "Arrangementet er opprettet",
        description:
          konfliktAntall > 0
            ? `${formaterAntallBanetider(result.antallOpprettet)} ble opprettet. ${konfliktAntall} tidspunkt${
                konfliktAntall === 1 ? "" : "er"
              } ble ikke tatt med på grunn av konflikter.`
            : `${formaterAntallBanetider(result.antallOpprettet)} ble opprettet.`,
      });
    } catch {
      // feil vises via opprettFeil
    }
  };

  if (isLoading) return <Page.Loading label="Laster arrangementskjemaet" />;

  return (
    <>
      <Form.Steps
        value={aktivTab}
        onValueChange={(value) => setAktivTab(value as typeof aktivTab)}
        label="Opprett arrangement"
        items={[
          { value: "metadata", label: "Informasjon" },
          { value: "bookinger", label: "Tider" },
        ]}
      >
        {aktivTab === "metadata" ? (
          <Form
            variant="editor"
            onSubmit={(event) => {
              event.preventDefault();
              setAktivTab("bookinger");
            }}
          >
            <Settings.Stack embedded>
              <Settings.Section
                embedded
                eyebrow="Arrangement"
                title="Grunnlag"
                description="Velg gren og kategori, og legg inn en intern beskrivelse."
              >
                <Form.Fields>
                  {grener.length > 1 ? (
                    <Form.Field
                      label="Gren"
                      description="Styrer hvilke baner du kan velge."
                      htmlFor="gren"
                    >
                      <Select value={valgtGrenId} onValueChange={håndterGrenEndring}>
                        <SelectTrigger id="gren" aria-label="Gren">
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
                    </Form.Field>
                  ) : null}

                  <Form.Field label="Kategori" htmlFor="kategori">
                    <Select
                      value={kategori}
                      onValueChange={(value) => setKategori(value as ArrangementKategori)}
                    >
                      <SelectTrigger id="kategori" aria-label="Kategori">
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
                  </Form.Field>

                  <Form.Field
                    label="Intern beskrivelse"
                    description="Vises i Banebooking og kan endres senere."
                    htmlFor="beskrivelse"
                  >
                    <Textarea
                      id="beskrivelse"
                      value={beskrivelse}
                      onChange={(event) => setBeskrivelse(event.target.value)}
                      placeholder="Kort beskrivelse av arrangementet"
                    />
                  </Form.Field>
                </Form.Fields>
              </Settings.Section>

              <Settings.Section
                embedded
                eyebrow="Nettside"
                title="Publisering"
                description="Bestem om arrangementet også skal presenteres på klubbens nettside."
              >
                <Form.Fields>
                  <Settings.SwitchRow
                    title="Vis på nettsiden"
                    description="Publiser med en egen tittel og presentasjonstekst."
                    checked={publisertPåNettsiden}
                    onCheckedChange={setPublisertPåNettsiden}
                  />

                  {publisertPåNettsiden ? (
                    <>
                      <Form.Field label="Tittel på nettsiden" htmlFor="nettside-tittel">
                        <Input
                          id="nettside-tittel"
                          value={nettsideTittel}
                          onChange={(event) => setNettsideTittel(event.target.value)}
                          placeholder="F.eks. Vårturnering 2026"
                          maxLength={100}
                        />
                      </Form.Field>
                      <Form.Field label="Presentasjon på nettsiden">
                        <LazyTiptapEditor
                          content={nettsideBeskrivelse}
                          onChange={setNettsideBeskrivelse}
                        />
                      </Form.Field>
                    </>
                  ) : null}
                </Form.Fields>
              </Settings.Section>

              <Form.Actions>
                <Button type="submit">Neste: Tider</Button>
              </Form.Actions>
            </Settings.Stack>
          </Form>
        ) : (
          <Form
            variant="editor"
            onSubmit={(event) => {
              event.preventDefault();
              void håndterOpprett();
            }}
          >
            <Settings.Stack embedded>
              <Settings.Section
                embedded
                eyebrow="Tider"
                title="Velg oppsett"
                description="Begge metodene legger konkrete forslag i den samme listen."
              >
                <Form.Fields>
                  <Form.Field label="Metode">
                    <Settings.RadioGroup
                      label="Velg oppsettstype"
                      value={oppsettsModus}
                      onValueChange={(value) => setOppsettsModus(value as typeof oppsettsModus)}
                      options={[
                        { value: "gjentakende", label: "Gjentakende" },
                        { value: "manuell", label: "Manuelt" },
                      ]}
                    />
                  </Form.Field>
                </Form.Fields>
              </Settings.Section>

              <Settings.Section
                embedded
                eyebrow="Oppsett"
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
              </Settings.Section>

              <Settings.Section
                embedded
                eyebrow="Kontroll"
                title="Banetider"
                description="Kontroller forslagene før arrangementet opprettes."
              >
                <BookingListe bookinger={bookinger} onRediger={håndterRediger} />
              </Settings.Section>

              <Form.Actions>
                {opprettFeedback ? <ActionFeedback {...opprettFeedback} /> : null}
                <ServerFeil feil={opprettFeil?.message ?? null} />
                <Button
                  type="submit"
                  disabled={
                    opprettbareBookinger.length === 0 || isCreating || sjekkKonflikterLoading
                  }
                >
                  {isCreating
                    ? "Oppretter…"
                    : sjekkKonflikterLoading
                      ? "Sjekker konflikter…"
                      : opprettbareBookinger.length > 0
                        ? `Opprett arrangement (${opprettbareBookinger.length})`
                        : aktiveBookinger.length > 0
                          ? "Ingen ledige tider"
                          : "Opprett arrangement"}
                </Button>
              </Form.Actions>
            </Settings.Stack>
          </Form>
        )}
      </Form.Steps>

      <RedigerBookingModal
        key={redigeringsMålId ?? "closed"}
        booking={
          redigeringsMålId !== null
            ? (bookinger.find((b) => b.id === redigeringsMålId) ?? null)
            : null
        }
        baner={baner}
        onBekreft={håndterRedigerBekreft}
        onFjernEllerAvlys={håndterFjernEllerAvlys}
        onAvbryt={() => setRedigeringsMålId(null)}
      />
    </>
  );
}
