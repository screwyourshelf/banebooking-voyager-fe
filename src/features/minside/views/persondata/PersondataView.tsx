import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row, InfoRow } from "@/components/rows";
import LoaderSkeleton from "@/components/LoaderSkeleton";

import { formatDatoKort } from "@/utils/datoUtils";
import { useMeg } from "@/hooks/useMeg";
import { useSlug } from "@/hooks/useSlug";

export default function PersondataView() {
  const slug = useSlug();
  const { bruker, laster, lastNedEgenData, slettMeg } = useMeg();

  const [lasterNed, setLasterNed] = useState(false);

  if (laster || !bruker) return <LoaderSkeleton />;

  const vilkarStatus = !bruker.vilkårAkseptertDato
    ? "Ikke registrert"
    : `Akseptert ${formatDatoKort(bruker.vilkårAkseptertDato)}${
        bruker.vilkårVersjon ? ` (versjon ${bruker.vilkårVersjon})` : ""
      }`;

  const handleLastNed = async () => {
    if (lasterNed) return;

    try {
      setLasterNed(true);
      await lastNedEgenData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kunne ikke laste ned egen data";
      toast.error(message);
    } finally {
      setLasterNed(false);
    }
  };

  return (
    <div>
      <PageSection title="Persondata" description="Her kan du se vilkår og laste ned egne data.">
        <RowPanel>
          <RowList>
            <InfoRow
              label="Vilkår"
              description="Vilkårene aksepteres automatisk ved første innlogging."
              value={vilkarStatus}
            />

            <Row
              title="Les vilkårene"
              description="Åpnes i ny fane."
              right={
                <Link
                  to={`/${slug}/vilkaar`}
                  className="text-sm underline text-primary hover:text-primary/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Åpne
                </Link>
              }
            />

            <Row
              title="Last ned dine data"
              description="JSON med registrerte opplysninger og bookinger."
              right={
                <Button
                  onClick={handleLastNed}
                  size="sm"
                  variant="outline"
                  disabled={lasterNed || slettMeg.isPending}
                >
                  {lasterNed ? "Laster..." : "Last ned"}
                </Button>
              }
            />
          </RowList>
        </RowPanel>
      </PageSection>
    </div>
  );
}
