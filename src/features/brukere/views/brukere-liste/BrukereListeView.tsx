import { useMemo, useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton";

import { useBruker } from "@/hooks/useBruker";
import { useAdminBrukere } from "@/features/brukere/hooks/useAdminBrukere";

import type { RolleType, BrukerRespons, EditState } from "@/features/brukere/types";
import BrukereListeContent from "./BrukereListeContent";
import RedigerBrukerDialog from "./RedigerBrukerDialog";

function erSlettetEpost(epost?: string | null) {
  if (!epost) return false;
  return epost.toLowerCase().startsWith("slettet_");
}

export default function BrukereListeView() {
  const { bruker, laster: lasterBruker } = useBruker();

  const { brukere, laster: lasterListe, oppdater, oppdaterLaster } = useAdminBrukere();

  const erKlubbAdmin = bruker?.roller.includes("KlubbAdmin");

  // Filters
  const [query, setQuery] = useState("");
  const [visSlettede, setVisSlettede] = useState(false);
  const [rolleFilter, setRolleFilter] = useState<RolleType[]>([]);

  // Dialog
  const [aktivBruker, setAktivBruker] = useState<BrukerRespons | null>(null);
  const [edit, setEdit] = useState<EditState>({ rolle: "Medlem", visningsnavn: "" });

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

  if (lasterBruker) return <LoaderSkeleton />;

  if (!erKlubbAdmin) {
    return (
      <p className="text-sm text-destructive px-2 py-2 text-center">
        Du har ikke tilgang til denne siden.
      </p>
    );
  }

  return (
    <>
      <BrukereListeContent
        query={query}
        onQueryChange={setQuery}
        visSlettede={visSlettede}
        onVisSlettedeChange={setVisSlettede}
        rolleFilter={rolleFilter}
        onToggleRolle={toggleRolle}
        onNullstillRolleFilter={() => setRolleFilter([])}
        filtrerteBrukere={filtrerteBrukere}
        lasterListe={lasterListe}
        currentBrukerId={bruker?.id}
        onRedigerBruker={åpenRedigering}
      />

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
  );
}
