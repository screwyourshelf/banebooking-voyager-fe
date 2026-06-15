import { Megaphone } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useBruker } from "@/hooks/useBruker";
import { useBekreftKunngjøring } from "@/features/kunngjøringer/hooks/useBekreftKunngjøring";
import { ErrorDisplay, ServerFeil } from "@/components/errors";
import { Button } from "@/components/ui/button";

export default function KunngjøringPage() {
  const { bruker, laster } = useBruker();
  const kunngjøring = bruker?.ulestKunngjøring;
  const { bekreft, laster: bekrefter, feil } = useBekreftKunngjøring(kunngjøring?.id ?? "");

  if (laster) return null;

  if (!kunngjøring) {
    return <Navigate to=".." replace />;
  }

  return (
    <ErrorDisplay icon={Megaphone} title={kunngjøring.tittel} description={kunngjøring.tekst}>
      <div className="w-full max-w-xs space-y-3">
        <ServerFeil feil={feil?.message ?? null} />
        <Button className="w-full" onClick={() => void bekreft()} disabled={bekrefter}>
          OK, jeg har lest dette
        </Button>
      </div>
    </ErrorDisplay>
  );
}
