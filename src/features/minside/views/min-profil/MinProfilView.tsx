import { useState } from "react";
import { CircleAlert } from "lucide-react";

import { AdminPageLoading, AdminPageState } from "@/components/admin";
import { RecordListState } from "@/components/records";
import { Button } from "@/components/ui/button";
import { SlettMegDialog } from "@/features/minside/components";
import { useMeg } from "@/hooks/useMeg";
import { formaterRoller } from "@/utils/brukerPresentation";

import MinProfilContent, { type Mode } from "./MinProfilContent";
import { MAX_VISNINGSNAVN_LENGTH, validateVisningsnavn } from "./visningsnavn";

export default function MinProfilView() {
  const {
    bruker,
    laster: lasterMeg,
    error: megFeil,
    refetch,
    oppdaterVisningsnavn,
    slettMeg,
  } = useMeg();
  const { mutateAsync, isPending, isSuccess, reset } = oppdaterVisningsnavn;

  const [mode, setMode] = useState<Mode>("epost");
  const [visningsnavn, setVisningsnavn] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize form from server data (render-time adjust)
  // Use null as sentinel so cached data on first render still triggers initialization
  const [prevBruker, setPrevBruker] = useState<typeof bruker | null>(null);
  if (bruker && bruker !== prevBruker) {
    setPrevBruker(bruker);
    const navn = bruker.visningsnavn?.trim();
    if (!navn || navn === bruker.epost) {
      setMode("epost");
      setVisningsnavn("");
    } else {
      setMode("navn");
      setVisningsnavn(navn);
    }
    setError(null);
  }

  if (lasterMeg) return <AdminPageLoading label="Laster profil" />;

  if (megFeil || !bruker) {
    return (
      <AdminPageState>
        <RecordListState
          icon={<CircleAlert aria-hidden="true" />}
          title="Kunne ikke laste profilen"
          description={megFeil?.message ?? "Prøv igjen om litt."}
          action={
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Prøv igjen
            </Button>
          }
          tone="danger"
          role="alert"
        />
      </AdminPageState>
    );
  }

  const valgtVisningsnavn = mode === "epost" ? bruker.epost : visningsnavn.trim();

  const gammel = (bruker.visningsnavn ?? "").trim();
  const ny = valgtVisningsnavn;

  const valideringsFeil = mode === "navn" ? validateVisningsnavn(visningsnavn) : null;

  const canSubmit = ny.length > 0 && ny !== gammel && (mode === "epost" || !valideringsFeil);

  async function lagreVisningsnavn() {
    setError(valideringsFeil);
    if (valideringsFeil) return;

    try {
      await mutateAsync({ visningsnavn: valgtVisningsnavn });
    } catch {
      // feil vises via oppdaterVisningsnavn.error
    }
  }

  return (
    <MinProfilContent
      epost={bruker.epost}
      rollerText={formaterRoller(bruker.roller, "Ingen klubbrolle")}
      mode={mode}
      onSetMode={(m) => {
        reset();
        setMode(m);
        setError(null);
      }}
      visningsnavn={visningsnavn}
      onChangeVisningsnavn={(value) => {
        reset();
        setVisningsnavn(value);
        if (error) setError(null);
      }}
      maxLength={MAX_VISNINGSNAVN_LENGTH}
      error={error}
      serverFeil={oppdaterVisningsnavn.error?.message ?? null}
      lagret={isSuccess && !canSubmit}
      canSubmit={canSubmit}
      isSaving={isPending}
      onSubmit={() => void lagreVisningsnavn()}
      medlemskapBekreftelseLabel={bruker.medlemskapBekreftelseLabel}
      fulltNavn={bruker.fulltNavn}
      medlemskapType={bruker.medlemskapType}
      medlemskapBekreftetDato={bruker.medlemskapBekreftetDato}
      deleteAction={<SlettMegDialog slettMeg={slettMeg} disabled={isPending} />}
    />
  );
}
