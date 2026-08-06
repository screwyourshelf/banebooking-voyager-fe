import { useMemo, useState } from "react";
import { addDays, endOfYear, startOfDay, startOfYear, subYears } from "date-fns";
import { ChartNoAxesCombined, CircleAlert, RefreshCw } from "lucide-react";
import { AdminPageState } from "@/components/admin";
import CardSection from "@/components/layout/CardSection";
import Tabs from "@/components/navigation/Tabs";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import BanestatistikkTable from "@/features/statistikk/components/BanestatistikkTable";
import BookingerPerMånedChart from "@/features/statistikk/components/BookingerPerMånedChart";
import BookingtypeDonut from "@/features/statistikk/components/BookingtypeDonut";
import FordelingBarListe from "@/features/statistikk/components/FordelingBarListe";
import Medlemsstatistikk from "@/features/statistikk/components/Medlemsstatistikk";
import NøkkeltallGrid from "@/features/statistikk/components/NøkkeltallGrid";
import StatistikkFilter from "@/features/statistikk/components/StatistikkFilter";
import StatistikkLoading from "@/features/statistikk/components/StatistikkLoading";
import TidPåDøgnetChart from "@/features/statistikk/components/TidPåDøgnetChart";
import { useBookingstatistikk } from "@/features/statistikk/hooks/useBookingstatistikk";
import {
  formatDatoIso,
  formatTidspunkt,
  formatTimer,
  formatUkedag,
} from "@/features/statistikk/statistikkPresentation";
import type {
  BookingstatistikkFiltre,
  BookingstatistikkRespons,
  Medlemsbookingtype,
  StatistikkPeriodevalg,
} from "@/features/statistikk/types";
import { useBaner } from "@/hooks/useBaner";
import { useGrener } from "@/hooks/useGrener";
import { tilDatoTekst } from "@/utils/datoUtils";

function periodeFor(valg: Exclude<StatistikkPeriodevalg, "egendefinert">) {
  const iDag = startOfDay(new Date());

  if (valg === "forrige-år") {
    const forrigeÅr = subYears(iDag, 1);
    return {
      fra: tilDatoTekst(startOfYear(forrigeÅr)),
      til: tilDatoTekst(endOfYear(forrigeÅr)),
    };
  }

  if (valg === "siste-12") {
    return {
      fra: tilDatoTekst(addDays(subYears(iDag, 1), 1)),
      til: tilDatoTekst(iDag),
    };
  }

  return {
    fra: tilDatoTekst(startOfYear(iDag)),
    til: tilDatoTekst(iDag),
  };
}

function initialFiltre(): BookingstatistikkFiltre {
  return {
    ...periodeFor("året-så-langt"),
    sammenlignMedForrigeÅr: true,
    grenId: null,
    baneId: null,
  };
}

type Statistikkfane = "banebruk" | "medlemmer";

function velgMedlemsstatistikk(
  statistikk: BookingstatistikkRespons,
  bookingtype: Medlemsbookingtype
) {
  if (bookingtype === "alle") return statistikk.medlemmer;
  return statistikk.medlemmerPerBookingtype[bookingtype];
}

export default function StatistikkView() {
  const [periodevalg, setPeriodevalg] = useState<StatistikkPeriodevalg>("året-så-langt");
  const [filtre, setFiltre] = useState<BookingstatistikkFiltre>(initialFiltre);
  const [aktivFane, setAktivFane] = useState<Statistikkfane>("banebruk");
  const [medlemsbookingtype, setMedlemsbookingtype] = useState<Medlemsbookingtype>("alle");
  const { grener, isLoading: lasterGrener } = useGrener(true);
  const { baner, isLoading: lasterBaner } = useBaner(true);
  const statistikkQuery = useBookingstatistikk(filtre);

  const tilgjengeligeBaner = useMemo(
    () => (filtre.grenId ? baner.filter((bane) => bane.grenId === filtre.grenId) : baner),
    [baner, filtre.grenId]
  );

  function handlePeriodevalgChange(valg: StatistikkPeriodevalg) {
    setPeriodevalg(valg);
    if (valg === "egendefinert") return;
    setFiltre((forrige) => ({ ...forrige, ...periodeFor(valg) }));
  }

  function handleFraChange(dato: Date) {
    const fra = tilDatoTekst(dato);
    setPeriodevalg("egendefinert");
    setFiltre((forrige) => ({
      ...forrige,
      fra,
      til: forrige.til < fra ? fra : forrige.til,
    }));
  }

  function handleTilChange(dato: Date) {
    const til = tilDatoTekst(dato);
    setPeriodevalg("egendefinert");
    setFiltre((forrige) => ({ ...forrige, til }));
  }

  function handleGrenChange(grenId: string | null) {
    setFiltre((forrige) => {
      const valgtBane = baner.find((bane) => bane.id === forrige.baneId);
      return {
        ...forrige,
        grenId,
        baneId: !grenId || (valgtBane && valgtBane.grenId !== grenId) ? null : forrige.baneId,
      };
    });
  }

  const statistikk = statistikkQuery.data;
  const lasterOppsett = lasterGrener || lasterBaner;
  const mestBrukteUkedag = statistikk?.perUkedag.length
    ? statistikk.perUkedag.reduce((mestBrukt, ukedag) =>
        ukedag.bookedeTimer > mestBrukt.bookedeTimer ? ukedag : mestBrukt
      )
    : undefined;

  return (
    <div className="statistics-dashboard">
      <StatistikkFilter
        filtre={filtre}
        periodevalg={periodevalg}
        grener={grener}
        baner={tilgjengeligeBaner}
        medlemsbookingtype={aktivFane === "medlemmer" ? medlemsbookingtype : undefined}
        disabled={lasterOppsett}
        onPeriodevalgChange={handlePeriodevalgChange}
        onFraChange={handleFraChange}
        onTilChange={handleTilChange}
        onSammenligningChange={(checked) =>
          setFiltre((forrige) => ({ ...forrige, sammenlignMedForrigeÅr: checked }))
        }
        onGrenChange={handleGrenChange}
        onBaneChange={(baneId) => setFiltre((forrige) => ({ ...forrige, baneId }))}
        onMedlemsbookingtypeChange={setMedlemsbookingtype}
      />

      {statistikkQuery.isLoading && !statistikk ? (
        <StatistikkLoading />
      ) : statistikkQuery.error && !statistikk ? (
        <AdminPageState>
          <RecordListState
            icon={<CircleAlert aria-hidden="true" />}
            title="Kunne ikke laste statistikken"
            description={statistikkQuery.error.message}
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => void statistikkQuery.refetch()}
                disabled={statistikkQuery.isFetching}
              >
                <RefreshCw aria-hidden="true" />
                {statistikkQuery.isFetching ? "Prøver igjen…" : "Prøv igjen"}
              </Button>
            }
            tone="danger"
            role="alert"
          />
        </AdminPageState>
      ) : statistikk ? (
        <div
          className="statistics-dashboard__results"
          data-fetching={statistikkQuery.isFetching || undefined}
          aria-busy={statistikkQuery.isFetching}
        >
          <div className="statistics-dashboard__status">
            <span>
              {formatDatoIso(statistikk.periode.fra)}–{formatDatoIso(statistikk.periode.til)}
            </span>
            <span>
              {statistikkQuery.isFetching
                ? "Oppdaterer…"
                : `Beregnet ${formatTidspunkt(statistikk.generertTidspunkt)}`}
            </span>
          </div>

          {statistikk.nøkkeltall.antallBookinger === 0 ? (
            <CardSection>
              <RecordListState
                icon={<ChartNoAxesCombined aria-hidden="true" />}
                title="Ingen bookinger i perioden"
                description="Prøv en annen periode, gren eller bane for å se bookingaktivitet."
              />
            </CardSection>
          ) : (
            <Tabs
              variant="section"
              ariaLabel="Statistikkområder"
              value={aktivFane}
              onValueChange={(value) => setAktivFane(value as Statistikkfane)}
              items={[
                {
                  value: "banebruk",
                  label: "Banebruk",
                  content: (
                    <div className="statistics-dashboard__tab-content">
                      <NøkkeltallGrid statistikk={statistikk} />

                      <BookingerPerMånedChart
                        punkter={statistikk.perMåned}
                        visSammenligning={Boolean(statistikk.sammenligning)}
                      />

                      <div className="statistics-dashboard__distributions">
                        <BookingtypeDonut nøkkeltall={statistikk.nøkkeltall} />
                        <FordelingBarListe
                          title="Grener"
                          description={
                            filtre.grenId
                              ? "Bookede timer for valgt gren."
                              : "Bookede timer fordelt på klubbens grener. Velg en gren for å sammenligne banene."
                          }
                          punkter={statistikk.perGren.map((gren) => ({
                            id: gren.grenId,
                            label: gren.grenNavn,
                            bookedeTimer: gren.bookedeTimer,
                            sammenligningBookedeTimer: gren.sammenligningBookedeTimer,
                          }))}
                        />
                      </div>

                      <FordelingBarListe
                        title="Ukemønster"
                        description="Bookede timer fordelt på ukedag."
                        oppsummering={
                          mestBrukteUkedag
                            ? `Mest brukt: ${formatUkedag(mestBrukteUkedag.ukedag)} · ${formatTimer(
                                mestBrukteUkedag.bookedeTimer
                              )}`
                            : undefined
                        }
                        punkter={statistikk.perUkedag.map((ukedag) => ({
                          id: String(ukedag.ukedag),
                          label: formatUkedag(ukedag.ukedag),
                          bookedeTimer: ukedag.bookedeTimer,
                          sammenligningBookedeTimer: ukedag.sammenligningBookedeTimer,
                        }))}
                      />

                      <TidPåDøgnetChart
                        punkter={statistikk.perTime}
                        visSammenligning={Boolean(statistikk.sammenligning)}
                      />

                      {filtre.grenId ? <BanestatistikkTable baner={statistikk.perBane} /> : null}
                    </div>
                  ),
                },
                {
                  value: "medlemmer",
                  label: "Medlemmer",
                  content: (
                    <Medlemsstatistikk
                      medlemmer={velgMedlemsstatistikk(statistikk, medlemsbookingtype)}
                      bookingtype={medlemsbookingtype}
                    />
                  ),
                },
              ]}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
