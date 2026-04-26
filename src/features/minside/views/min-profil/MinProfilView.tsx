import { useState } from "react";

import { FormSkeleton } from "@/components/loading";
import { SlettMegDialog } from "@/features/minside/components";
import { useMeg } from "@/hooks/useMeg";

import MinProfilContent, { type Mode } from "./MinProfilContent";
import { MAX_VISNINGSNAVN_LENGTH, validateVisningsnavn } from "./visningsnavn";

export default function MinProfilView() {
  const { bruker, laster: lasterMeg, oppdaterVisningsnavn, slettMeg } = useMeg();
  const { mutateAsync, isPending } = oppdaterVisningsnavn;

  const [mode, setMode] = useState<Mode>("epost");
  const [visningsnavn, setVisningsnavn] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize form from server data (render-time adjust)
  const [prevBruker, setPrevBruker] = useState(bruker);
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

  if (lasterMeg || !bruker) return <FormSkeleton />;

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
      rollerText={bruker.roller.join(", ")}
      mode={mode}
      onSetMode={(m) => {
        setMode(m);
        setError(null);
      }}
      visningsnavn={visningsnavn}
      onChangeVisningsnavn={(value) => {
        setVisningsnavn(value);
        if (error) setError(null);
      }}
      maxLength={MAX_VISNINGSNAVN_LENGTH}
      error={error}
      serverFeil={oppdaterVisningsnavn.error?.message ?? null}
      canSubmit={canSubmit}
      isSaving={isPending}
      onSubmit={() => void lagreVisningsnavn()}
      deleteAction={<SlettMegDialog slettMeg={slettMeg} />}
      isDeleteDisabled={isPending}
    />
  );
}
