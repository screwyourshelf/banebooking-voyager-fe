import { useEffect, useMemo, useRef, useState } from "react";

import { AdminPageLoading } from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { ActionFeedback, type ActionFeedbackMessage } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { lagBookingNøkkel } from "../../components/BookingListe/bookingListeUtils";
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

  // Opprett-handler – bygger DTO direkte fra BookingListen og kaller API
  const håndterOpprett = async () => {
    const aktiveBookinger = bookinger.filter((b) => !b.erSlettet);

    if (aktiveBookinger.length === 0) {
      setOpprettFeedback({
        tone: "warning",
        title: "Arrangementet mangler banetider",
        description: "Legg til minst én banetid før du oppretter arrangementet.",
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
      if (result.antallOpprettet === 0) {
        setOpprettFeedback({
          tone: "warning",
          title: "Ingen banetider ble opprettet",
          description:
            "Alle valgte tidspunkter var allerede opptatt. Juster forslagene og prøv igjen.",
        });
        return;
      }

      const konfliktAntall = result.konflikter.length;
      onCreated?.({
        tone: konfliktAntall > 0 ? "warning" : "success",
        title: "Arrangementet er opprettet",
        description:
          konfliktAntall > 0
            ? `${formaterAntallBanetider(result.antallOpprettet)} ble opprettet. ${konfliktAntall} tidspunkt${
                konfliktAntall === 1 ? "" : "er"
              } ble hoppet over på grunn av konflikter.`
            : `${formaterAntallBanetider(result.antallOpprettet)} ble opprettet.`,
      });
    } catch {
      // feil vises via opprettFeil
    }
  };

  if (isLoading) return <AdminPageLoading label="Laster arrangementskjemaet" />;

  return (
    <>
      <Tabs
        value={aktivTab}
        onValueChange={(value) => setAktivTab(value as typeof aktivTab)}
        className="gap-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10"
      >
        <div className="border-b px-4 sm:px-6">
          <TabsList
            variant="line"
            aria-label="Opprett arrangement"
            className="h-12 w-full justify-start gap-6"
          >
            <TabsTrigger value="metadata" className="flex-none px-0">
              Informasjon
            </TabsTrigger>
            <TabsTrigger value="bookinger" className="flex-none px-0">
              Tider
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="metadata" className="mt-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAktivTab("bookinger");
            }}
          >
            <section className="px-4 py-6 sm:px-6">
              <div className="mb-5 space-y-1">
                <p className="text-xs font-medium tracking-wide text-primary uppercase">Steg 1</p>
                <h2 className="font-heading text-lg font-medium">Grunnlag</h2>
                <p className="text-sm text-muted-foreground">
                  Velg gren og kategori, og legg inn en intern beskrivelse.
                </p>
              </div>

              <div className="divide-y border-y">
                {grener.length > 1 ? (
                  <div className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-center">
                    <div className="space-y-1">
                      <Label htmlFor="gren">Gren</Label>
                      <p className="text-sm text-muted-foreground">
                        Styrer hvilke baner du kan velge.
                      </p>
                    </div>
                    <Select value={valgtGrenId} onValueChange={håndterGrenEndring}>
                      <SelectTrigger id="gren" className="w-full">
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
                  </div>
                ) : null}

                <div className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-center">
                  <Label htmlFor="kategori">Kategori</Label>
                  <Select
                    value={kategori}
                    onValueChange={(value) => setKategori(value as ArrangementKategori)}
                  >
                    <SelectTrigger id="kategori" className="w-full">
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
                </div>

                <div className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-start">
                  <div className="space-y-1">
                    <Label htmlFor="beskrivelse">Intern beskrivelse</Label>
                    <p className="text-sm text-muted-foreground">
                      Vises i Banebooking og kan endres senere.
                    </p>
                  </div>
                  <Textarea
                    id="beskrivelse"
                    value={beskrivelse}
                    onChange={(event) => setBeskrivelse(event.target.value)}
                    placeholder="Kort beskrivelse av arrangementet"
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className="px-4 py-6 sm:px-6">
              <div className="mb-5 space-y-1">
                <h2 className="font-heading text-lg font-medium">Publisering</h2>
                <p className="text-sm text-muted-foreground">
                  Bestem om arrangementet også skal presenteres på klubbens nettside.
                </p>
              </div>

              <div className="divide-y border-y">
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="publisert">Vis på nettsiden</Label>
                    <p className="text-sm text-muted-foreground">
                      Publiser med en egen tittel og presentasjonstekst.
                    </p>
                  </div>
                  <Switch
                    id="publisert"
                    checked={publisertPåNettsiden}
                    onCheckedChange={setPublisertPåNettsiden}
                  />
                </div>

                {publisertPåNettsiden ? (
                  <>
                    <div className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-center">
                      <Label htmlFor="nettside-tittel">Tittel på nettsiden</Label>
                      <Input
                        id="nettside-tittel"
                        value={nettsideTittel}
                        onChange={(event) => setNettsideTittel(event.target.value)}
                        placeholder="F.eks. Vårturnering 2026"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-3 py-4">
                      <Label>Presentasjon på nettsiden</Label>
                      <LazyTiptapEditor
                        content={nettsideBeskrivelse}
                        onChange={setNettsideBeskrivelse}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            <div className="flex justify-end border-t bg-muted/20 px-4 py-4 sm:px-6">
              <Button type="submit">Neste: Tider</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="bookinger" className="mt-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void håndterOpprett();
            }}
          >
            <section className="px-4 py-6 sm:px-6">
              <div className="mb-5 space-y-1">
                <p className="text-xs font-medium tracking-wide text-primary uppercase">Steg 2</p>
                <h2 className="font-heading text-lg font-medium">Velg oppsett</h2>
                <p className="text-sm text-muted-foreground">
                  Begge metodene legger konkrete forslag i den samme listen.
                </p>
              </div>
              <RadioGroup
                aria-label="Oppsettstype"
                value={oppsettsModus}
                onValueChange={(value) => setOppsettsModus(value as typeof oppsettsModus)}
                className="grid max-w-lg grid-cols-2 gap-3"
              >
                <Label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                  <RadioGroupItem value="gjentakende" />
                  Gjentakende
                </Label>
                <Label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                  <RadioGroupItem value="manuell" />
                  Manuelt
                </Label>
              </RadioGroup>
            </section>

            <Separator />

            <section className="px-4 py-6 sm:px-6">
              <div className="mb-5 space-y-1">
                <h2 className="font-heading text-lg font-medium">
                  {oppsettsModus === "gjentakende" ? "Gjentakende tider" : "Manuelle tider"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {oppsettsModus === "gjentakende"
                    ? "Velg periode, ukedager, baner og tidspunkter."
                    : "Velg konkrete datoer, baner og tidspunkter."}
                </p>
              </div>
              {oppsettsModus === "gjentakende" ? (
                <GjentakendeOppsett baner={baner} onGenerer={håndterGenerer} />
              ) : (
                <ManueltOppsett baner={baner} onLeggTil={håndterGenerer} />
              )}
            </section>

            <Separator />

            <section className="px-4 py-6 sm:px-6">
              <BookingListe
                bookinger={bookinger}
                onRediger={håndterRediger}
                onFjernEllerAvlys={håndterFjernEllerAvlys}
              />
            </section>

            <div className="space-y-3 border-t bg-muted/20 px-4 py-4 sm:px-6">
              {opprettFeedback ? <ActionFeedback {...opprettFeedback} /> : null}
              <ServerFeil feil={opprettFeil?.message ?? null} />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    bookinger.filter((booking) => !booking.erSlettet).length === 0 ||
                    isCreating ||
                    sjekkKonflikterLoading
                  }
                >
                  {isCreating
                    ? "Oppretter…"
                    : sjekkKonflikterLoading
                      ? "Sjekker konflikter…"
                      : `Opprett arrangement (${bookinger.filter((booking) => !booking.erSlettet).length})`}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
      </Tabs>

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
