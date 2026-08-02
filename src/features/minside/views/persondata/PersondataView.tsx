import { useState } from "react";
import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";

import {
  AdminFormActions,
  AdminPageLoading,
  AdminPageState,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsValue,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";

import { formatDatoKort } from "@/utils/datoUtils";
import { useMeg } from "@/hooks/useMeg";

export default function PersondataView() {
  const { bruker, laster, error, refetch, lastNedEgenData, slettMeg } = useMeg();

  const [lasterNed, setLasterNed] = useState(false);
  const [nedlastingsFeil, setNedlastingsFeil] = useState<string | null>(null);

  if (laster) return <AdminPageLoading label="Laster dataene dine" />;

  if (error || !bruker) {
    return (
      <AdminPageState>
        <RecordListState
          icon={<CircleAlert aria-hidden="true" />}
          title="Kunne ikke laste dataene dine"
          description={error?.message ?? "Prøv igjen om litt."}
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

  const handleLastNed = async () => {
    if (lasterNed) return;

    try {
      setLasterNed(true);
      setNedlastingsFeil(null);
      await lastNedEgenData();
    } catch (error) {
      setNedlastingsFeil(
        error instanceof Error ? error.message : "Kunne ikke laste ned dataene dine."
      );
    } finally {
      setLasterNed(false);
    }
  };

  return (
    <SettingsStack>
      <SettingsSection
        eyebrow="Personvern"
        title="Vilkår og samtykke"
        description="Se når og hvilken versjon du godtok."
      >
        <SettingsPanel>
          <SettingsRow title="Status" description="Vilkårene aksepteres ved første innlogging.">
            <RecordStatus tone={bruker.vilkårAkseptertDato ? "available" : "warning"}>
              {bruker.vilkårAkseptertDato ? "Akseptert" : "Ikke registrert"}
            </RecordStatus>
          </SettingsRow>
          {bruker.vilkårAkseptertDato ? (
            <SettingsRow title="Akseptert dato">
              <SettingsValue>{formatDatoKort(bruker.vilkårAkseptertDato)}</SettingsValue>
            </SettingsRow>
          ) : null}
          {bruker.vilkårVersjon ? (
            <SettingsRow title="Versjon">
              <SettingsValue>{bruker.vilkårVersjon}</SettingsValue>
            </SettingsRow>
          ) : null}
        </SettingsPanel>
        <AdminFormActions>
          <Button asChild type="button" variant="outline">
            <Link to="../vilkaar" target="_blank" rel="noopener noreferrer">
              Les vilkårene
            </Link>
          </Button>
        </AdminFormActions>
      </SettingsSection>

      <SettingsSection
        eyebrow="Eksport"
        title="Dine data"
        description="Last ned opplysningene Banebooking har lagret om deg."
      >
        <SettingsPanel>
          <SettingsRow title="Datafil" description="JSON med kontoopplysninger og bookede tider.">
            <RecordStatus tone="past">JSON</RecordStatus>
          </SettingsRow>
        </SettingsPanel>
        <AdminFormActions>
          <ServerFeil feil={nedlastingsFeil} title="Datafilen kunne ikke lastes ned" />
          <Button
            type="button"
            onClick={handleLastNed}
            variant="outline"
            disabled={lasterNed || slettMeg.isPending}
          >
            {lasterNed ? "Laster ned…" : "Last ned data"}
          </Button>
        </AdminFormActions>
      </SettingsSection>
    </SettingsStack>
  );
}
