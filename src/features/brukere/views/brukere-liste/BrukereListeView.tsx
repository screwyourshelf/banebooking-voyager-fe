import { useMemo, useState } from "react";
import { PageContentSkeleton } from "@/components/loading";

import { useBruker } from "@/hooks/useBruker";
import { useAdminBrukere } from "@/features/brukere/hooks/useAdminBrukere";
import { useAdminBrukersperre } from "@/features/brukere/hooks/useAdminBrukersperre";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import {
  SlettBrukerDialog,
  SperrBrukerDialog,
  SperreHistorikkDialog,
} from "@/features/brukere/components";

import type {
  RolleType,
  MedlemskapFilterType,
  BrukerRespons,
  BrukerSortering,
  EditState,
} from "@/features/brukere/types";
import { QueryFeil } from "@/components/errors";
import PageHeader from "@/components/layout/PageHeader";
import BrukereListeContent from "./BrukereListeContent";
import RedigerBrukerDialog from "./RedigerBrukerDialog";

function erSlettetEpost(epost?: string | null) {
  if (!epost) return false;
  return epost.toLowerCase().startsWith("slettet_");
}

export default function BrukereListeView() {
  const {
    bruker,
    laster: lasterBruker,
    feil: brukerFeil,
    isFetching: brukerFetching,
    refetch: refetchBruker,
  } = useBruker();

  const {
    brukere,
    laster: lasterListe,
    isFetching: brukereFetching,
    oppdater,
    oppdaterLaster,
    slett,
    slettLaster,
    oppdaterFeil,
    slettFeil,
    error: brukereError,
    hentBrukere,
  } = useAdminBrukere();

  const { sperr, opphev, sperrLaster, opphevLaster, sperrFeil, opphevFeil } =
    useAdminBrukersperre();

  const erKlubbAdmin = harHandling(bruker?.kapabiliteter, Kapabiliteter.brukere.admin);
  const harLeseTilgang = harHandling(bruker?.kapabiliteter, Kapabiliteter.brukere.lese);

  // Filters
  const [query, setQuery] = useState("");
  const [visSlettede, setVisSlettede] = useState(false);
  const [rolleFilter, setRolleFilter] = useState<RolleType[]>([]);
  const [medlemskapFilter, setMedlemskapFilter] = useState<MedlemskapFilterType[]>([]);
  const [sortering, setSortering] = useState<BrukerSortering>("nyeste");

  // Dialog
  const [aktivBruker, setAktivBruker] = useState<BrukerRespons | null>(null);
  const [edit, setEdit] = useState<EditState>({ rolle: "Medlem", visningsnavn: "" });
  const [sperreBruker, setSperreBruker] = useState<BrukerRespons | null>(null);

  const filtrerteBrukere = useMemo(() => {
    const q = query.toLowerCase().trim();

    const filtrert = brukere
      .filter((b) => {
        if (!visSlettede && erSlettetEpost(b.epost)) return false;
        return true;
      })
      .filter((b) => {
        if (rolleFilter.length === 0) return true;
        const rolle = (b.roller?.[0] ?? "Medlem") as RolleType;
        return rolleFilter.includes(rolle);
      })
      .filter((b) => {
        if (!q) return true;
        return b.epost?.toLowerCase().includes(q) || b.visningsnavn?.toLowerCase().includes(q);
      })
      .filter((b) => {
        if (medlemskapFilter.length === 0) return true;
        const erBekreftet = !!b.medlemskapBekreftetDato;
        return medlemskapFilter.includes(erBekreftet ? "bekreftet" : "ikke-bekreftet");
      });

    return [...filtrert].sort((a, b) => sammenlignBrukere(a, b, sortering));
  }, [brukere, query, visSlettede, rolleFilter, medlemskapFilter, sortering]);

  const åpenRedigering = (b: BrukerRespons) => {
    setAktivBruker(b);
    setEdit({
      rolle: (b.roller?.[0] ?? "Medlem") as RolleType,
      visningsnavn: b.visningsnavn ?? "",
    });
  };

  const lagreEndringer = async () => {
    if (!aktivBruker) return;

    try {
      await oppdater(aktivBruker.id, {
        rolle: edit.rolle,
        visningsnavn: edit.visningsnavn,
      });
      setAktivBruker(null);
    } catch {
      // feil vises via oppdaterFeil i RedigerBrukerDialog
    }
  };

  function toggleRolle(r: RolleType) {
    setRolleFilter((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  function toggleMedlemskap(m: MedlemskapFilterType) {
    setMedlemskapFilter((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function nullstillFiltre() {
    setQuery("");
    setVisSlettede(false);
    setRolleFilter([]);
    setMedlemskapFilter([]);
  }

  const handleSlettBruker = (brukerId: string) => async () => {
    await slett(brukerId);
  };

  const handleOpphev = (brukerId: string) => async (sperreId: string) => {
    try {
      await opphev(brukerId, sperreId);
    } catch {
      // feil vises via opphevFeil i SperreHistorikkDialog
    }
  };

  const åpneSperreHistorikk = (b: BrukerRespons) => {
    if (!harHandling(b.kapabiliteter, Kapabiliteter.brukere.seSperre)) return;
    setSperreBruker(b);
  };

  if (lasterBruker) {
    return <PageContentSkeleton label="Kontrollerer brukertilgang" rows={6} controls />;
  }

  if (brukerFeil) {
    return (
      <QueryFeil
        error={brukerFeil}
        isFetching={brukerFetching}
        onRetry={() => void refetchBruker()}
        title="Kunne ikke kontrollere tilgangen"
      />
    );
  }

  if (!erKlubbAdmin && !harLeseTilgang) {
    return <p className="user-admin-page__access-error">Du har ikke tilgang til denne siden.</p>;
  }

  return (
    <QueryFeil error={brukereError} isFetching={brukereFetching} onRetry={() => void hentBrukere()}>
      <div className="user-admin-page__content">
        <PageHeader
          eyebrow="Administrasjon"
          title="Brukere"
          description="Følg opp medlemskap, roller og tilgang til klubben."
          className="user-admin-page__heading"
        />

        <BrukereListeContent
          query={query}
          onQueryChange={setQuery}
          visSlettede={visSlettede}
          onVisSlettedeChange={setVisSlettede}
          rolleFilter={rolleFilter}
          onToggleRolle={toggleRolle}
          medlemskapFilter={medlemskapFilter}
          onToggleMedlemskap={toggleMedlemskap}
          sortering={sortering}
          onSorteringChange={setSortering}
          onResetFilters={nullstillFiltre}
          filtrerteBrukere={filtrerteBrukere}
          lasterListe={lasterListe}
          currentBrukerId={bruker?.id}
          erKlubbAdmin={erKlubbAdmin}
          onRedigerBruker={åpenRedigering}
          renderSlettAction={(b) => {
            const kanSlette = harHandling(b.kapabiliteter, Kapabiliteter.brukere.slett);
            if (!kanSlette) return null;

            return (
              <SlettBrukerDialog
                brukerEpost={b.epost}
                onSlett={handleSlettBruker(b.id)}
                isLoading={slettLaster}
                serverFeil={slettFeil?.message ?? null}
              />
            );
          }}
          renderSperrAction={(b) => {
            const kanSperr = harHandling(b.kapabiliteter, Kapabiliteter.brukere.sperr);
            if (!kanSperr) return null;

            return (
              <SperrBrukerDialog
                brukerEpost={b.epost}
                onSperr={(data) => sperr(b.id, data)}
                isLoading={sperrLaster}
                serverFeil={sperrFeil?.message ?? null}
              />
            );
          }}
          onÅpneSperreHistorikk={åpneSperreHistorikk}
        />

        {sperreBruker ? (
          <SperreHistorikkDialog
            brukerId={sperreBruker.id}
            brukerEpost={sperreBruker.epost}
            kanOppheve={harHandling(sperreBruker.kapabiliteter, Kapabiliteter.brukere.opphevSperre)}
            onOpphev={handleOpphev(sperreBruker.id)}
            opphevLaster={opphevLaster}
            opphevFeil={opphevFeil?.message ?? null}
            onClose={() => setSperreBruker(null)}
          />
        ) : null}

        {aktivBruker ? (
          <RedigerBrukerDialog
            aktivBruker={aktivBruker}
            edit={edit}
            onEditChange={(update) => setEdit((s) => ({ ...s, ...update }))}
            onClose={() => setAktivBruker(null)}
            onSave={lagreEndringer}
            isSaving={oppdaterLaster}
            serverFeil={oppdaterFeil?.message ?? null}
          />
        ) : null}
      </div>
    </QueryFeil>
  );
}

function sammenlignBrukere(a: BrukerRespons, b: BrukerRespons, sortering: BrukerSortering) {
  if (sortering === "navn") {
    const aNavn = a.visningsnavn?.trim() || a.fulltNavn?.trim() || a.epost;
    const bNavn = b.visningsnavn?.trim() || b.fulltNavn?.trim() || b.epost;
    return aNavn.localeCompare(bNavn, "nb-NO", { sensitivity: "base" });
  }

  const aTid = a.opprettetTid ? new Date(a.opprettetTid).getTime() : Number.NaN;
  const bTid = b.opprettetTid ? new Date(b.opprettetTid).getTime() : Number.NaN;
  if (Number.isNaN(aTid)) return Number.isNaN(bTid) ? 0 : 1;
  if (Number.isNaN(bTid)) return -1;

  return sortering === "nyeste" ? bTid - aTid : aTid - bTid;
}
