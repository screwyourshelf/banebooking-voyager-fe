import { Link } from "react-router-dom";
import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { Form, Settings, Page } from "@/components";

import { ServerFeil } from "@/components/errors";
import { RecordListState, RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";

import { formatDatoKort } from "@/utils/datoUtils";
import { useMeg } from "@/hooks/useMeg";

export default function PersondataView() {
  const { bruker, laster, error, refetch, lastNedEgenData, slettMeg } = useMeg();

  const [lasterNed, setLasterNed] = useState(false);
  const [nedlastingsFeil, setNedlastingsFeil] = useState<string | null>(null);

  if (laster) return <Page.Loading label="Laster dataene dine" />;

  if (error || !bruker) {
    return (
      <Page.State>
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
      </Page.State>
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
    <Settings.Stack>
      <Settings.Section
        eyebrow="Personvern"
        title="Vilkår og samtykke"
        description="Se når og hvilken versjon du godtok."
      >
        <Settings.Panel>
          <Settings.Row title="Status" description="Vilkårene aksepteres ved første innlogging.">
            <RecordStatus tone={bruker.vilkårAkseptertDato ? "available" : "warning"}>
              {bruker.vilkårAkseptertDato ? "Akseptert" : "Ikke registrert"}
            </RecordStatus>
          </Settings.Row>
          {bruker.vilkårAkseptertDato ? (
            <Settings.Row title="Akseptert dato">
              <Settings.Value>{formatDatoKort(bruker.vilkårAkseptertDato)}</Settings.Value>
            </Settings.Row>
          ) : null}
          {bruker.vilkårVersjon ? (
            <Settings.Row title="Versjon">
              <Settings.Value>{bruker.vilkårVersjon}</Settings.Value>
            </Settings.Row>
          ) : null}
        </Settings.Panel>
        <Form.Actions>
          <Button asChild type="button" variant="outline">
            <Link to="../vilkaar" target="_blank" rel="noopener noreferrer">
              Les vilkårene
            </Link>
          </Button>
        </Form.Actions>
      </Settings.Section>

      <Settings.Section
        eyebrow="Eksport"
        title="Dine data"
        description="Last ned opplysningene Banebooking har lagret om deg."
      >
        <Settings.Panel>
          <Settings.Row title="Datafil" description="JSON med kontoopplysninger og bookede tider.">
            <RecordStatus tone="past">JSON</RecordStatus>
          </Settings.Row>
        </Settings.Panel>
        <Form.Actions>
          <ServerFeil feil={nedlastingsFeil} title="Datafilen kunne ikke lastes ned" />
          <Button
            type="button"
            onClick={handleLastNed}
            variant="outline"
            disabled={lasterNed || slettMeg.isPending}
          >
            {lasterNed ? "Laster ned…" : "Last ned data"}
          </Button>
        </Form.Actions>
      </Settings.Section>
    </Settings.Stack>
  );
}
