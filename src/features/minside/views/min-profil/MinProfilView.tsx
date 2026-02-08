import { useEffect, useState } from "react";

import { LoaderSkeleton } from "@/components/loading";
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

  useEffect(() => {
    if (!bruker) return;

    const navn = bruker.visningsnavn?.trim();
    if (!navn || navn === bruker.epost) {
      setMode("epost");
      setVisningsnavn("");
    } else {
      setMode("navn");
      setVisningsnavn(navn);
    }

    setError(null);
  }, [bruker]);

  if (lasterMeg || !bruker) return <LoaderSkeleton />;

  const valgtVisningsnavn = mode === "epost" ? bruker.epost : visningsnavn.trim();

  const gammel = (bruker.visningsnavn ?? "").trim();
  const ny = valgtVisningsnavn;

  const valideringsFeil = mode === "navn" ? validateVisningsnavn(visningsnavn) : null;

  const canSubmit = ny.length > 0 && ny !== gammel && (mode === "epost" || !valideringsFeil);

  async function lagreVisningsnavn() {
    // Sett error kun når bruker trykker lagre
    setError(valideringsFeil);
    if (valideringsFeil) return;

    await mutateAsync({ visningsnavn: valgtVisningsnavn });
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
      canSubmit={canSubmit}
      isSaving={isPending}
      onSubmit={() => void lagreVisningsnavn()}
      deleteAction={<SlettMegDialog slettMeg={slettMeg} />}
      isDeleteDisabled={isPending} // valgfritt: lås sletting mens vi lagrer navn
    />
  );
}
