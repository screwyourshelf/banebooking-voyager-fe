import { useMemo, useState } from "react";
import { ListSkeleton } from "@/components/loading";

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

import type { RolleType, BrukerRespons, EditState } from "@/features/brukere/types";
import { QueryFeil } from "@/components/errors";
import BrukereListeContent from "./BrukereListeContent";
import RedigerBrukerDialog from "./RedigerBrukerDialog";

function erSlettetEpost(epost?: string | null) {
  if (!epost) return false;
  return epost.toLowerCase().startsWith("slettet_");
}

export default function BrukereListeView() {
  const { bruker, laster: lasterBruker } = useBruker();

  const {
    brukere,
    laster: lasterListe,
    isFetching: brukereFetching,
    oppdater,
    oppdaterLaster,
    slett,
    slettLaster,
    error: brukereError,
    hentBrukere,
  } = useAdminBrukere();

  const { sperr, opphev, sperrLaster, opphevLaster } = useAdminBrukersperre();

  const erKlubbAdmin = harHandling(bruker?.kapabiliteter, Kapabiliteter.brukere.admin);

  // Filters
  const [query, setQuery] = useState("");
  const [visSlettede, setVisSlettede] = useState(false);
  const [rolleFilter, setRolleFilter] = useState<RolleType[]>([]);

  // Dialog
  const [aktivBruker, setAktivBruker] = useState<BrukerRespons | null>(null);
  const [edit, setEdit] = useState<EditState>({ rolle: "Medlem", visningsnavn: "" });
  const [sperreBruker, setSperreBruker] = useState<BrukerRespons | null>(null);

  const filtrerteBrukere = useMemo(() => {
    const q = query.toLowerCase().trim();

    return brukere
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
      });
  }, [brukere, query, visSlettede, rolleFilter]);

  const åpenRedigering = (b: BrukerRespons) => {
    setAktivBruker(b);
    setEdit({
      rolle: ((b.roller?.[0] ?? "Medlem") as RolleType) ?? "Medlem",
      visningsnavn: b.visningsnavn ?? "",
    });
  };

  const lagreEndringer = async () => {
    if (!aktivBruker) return;

    await oppdater(aktivBruker.id, {
      rolle: edit.rolle,
      visningsnavn: edit.visningsnavn,
    });

    setAktivBruker(null);
  };

  function toggleRolle(r: RolleType) {
    setRolleFilter((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  const handleSlettBruker = (brukerId: string) => async () => {
    await slett(brukerId);
  };

  const handleOpphev = (brukerId: string) => async (sperreId: string) => {
    await opphev(brukerId, sperreId);
  };

  const åpneSperreHistorikk = (b: BrukerRespons) => {
    if (!harHandling(b.kapabiliteter, Kapabiliteter.brukere.seSperre)) return;
    setSperreBruker(b);
  };

  if (lasterBruker) return <ListSkeleton />;

  if (!erKlubbAdmin) {
    return (
      <p className="text-sm text-destructive px-2 py-2 text-center">
        Du har ikke tilgang til denne siden.
      </p>
    );
  }

  return (
    <QueryFeil error={brukereError} isFetching={brukereFetching} onRetry={() => void hentBrukere()}>
      <>
        <BrukereListeContent
          query={query}
          onQueryChange={setQuery}
          visSlettede={visSlettede}
          onVisSlettedeChange={setVisSlettede}
          rolleFilter={rolleFilter}
          onToggleRolle={toggleRolle}
          filtrerteBrukere={filtrerteBrukere}
          lasterListe={lasterListe}
          currentBrukerId={bruker?.id}
          onRedigerBruker={åpenRedigering}
          renderSlettAction={(b) => {
            const kanSlette = harHandling(b.kapabiliteter, Kapabiliteter.brukere.slett);
            if (!kanSlette) return null;

            return (
              <SlettBrukerDialog
                brukerEpost={b.epost}
                onSlett={handleSlettBruker(b.id)}
                isLoading={slettLaster}
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
          />
        ) : null}
      </>
    </QueryFeil>
  );
}
