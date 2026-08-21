import DatoVelger from "@/components/DatoVelger";
import { Form, Settings } from "@/components";

import { ServerFeil } from "@/components/errors";
import { RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MedlemskapStatusRespons } from "@/types";
import { formatDatoKort } from "@/utils/datoUtils";

type Props = {
  status: MedlemskapStatusRespons | null;
  label: string;
  onLabelChange: (value: string) => void;
  gyldigTil: Date | null;
  onGyldigTilChange: (value: Date) => void;
  onAktiver: () => void;
  aktiverLaster: boolean;
  aktiverFeil: string | null;
  onDeaktiver: () => void;
  deaktiverLaster: boolean;
  deaktiverFeil: string | null;
};

export default function MedlemskapInnstillingerContent({
  status,
  label,
  onLabelChange,
  gyldigTil,
  onGyldigTilChange,
  onAktiver,
  aktiverLaster,
  aktiverFeil,
  onDeaktiver,
  deaktiverLaster,
  deaktiverFeil,
}: Props) {
  const aktivBekreftelse = status?.aktivBekreftelse ?? null;

  return (
    <Settings.Stack>
      <Settings.Section
        eyebrow="Medlemskap"
        title="Bekreftelsesperiode"
        description="Følg status og hvor mange som har fullført."
      >
        <Settings.Panel>
          <Settings.Row
            title="Status"
            description={
              aktivBekreftelse
                ? "Medlemmer blir bedt om å bekrefte."
                : "Medlemmer trenger ikke å bekrefte nå."
            }
          >
            <RecordStatus tone={aktivBekreftelse ? "available" : "past"}>
              {aktivBekreftelse?.label ?? "Ingen aktiv periode"}
            </RecordStatus>
          </Settings.Row>

          {aktivBekreftelse ? (
            <>
              <Settings.Row title="Startet">
                <Settings.Value>
                  {formatDatoKort(aktivBekreftelse.opprettetTidspunkt)}
                </Settings.Value>
              </Settings.Row>
              <Settings.Row title="Gyldig til">
                <Settings.Value>{formatDatoKort(aktivBekreftelse.gyldigTil)}</Settings.Value>
              </Settings.Row>
              <Settings.Row title="Bekreftet">
                <Settings.Value>
                  {status?.antallBekreftet ?? 0} av {status?.antallTotalt ?? 0} medlemmer
                </Settings.Value>
              </Settings.Row>
            </>
          ) : null}
        </Settings.Panel>
      </Settings.Section>

      {!aktivBekreftelse ? (
        <Form
          variant="settings"
          onSubmit={(event) => {
            event.preventDefault();
            onAktiver();
          }}
        >
          <Settings.Section
            eyebrow="Ny periode"
            title="Start medlemsbekreftelse"
            description="Alle medlemmer må bekrefte innen sluttdatoen."
          >
            <Form.Fields>
              <Form.Field
                label="Periodenavn"
                description='For eksempel "Sesong 2026".'
                htmlFor="medlemskap-label"
              >
                <Input
                  id="medlemskap-label"
                  aria-label="Periodenavn"
                  value={label}
                  onChange={(event) => onLabelChange(event.target.value)}
                  placeholder="Sesong 2026"
                  maxLength={100}
                  disabled={aktiverLaster}
                />
              </Form.Field>

              <Form.Field label="Gyldig til" description="Dato perioden utløper.">
                <DatoVelger
                  value={gyldigTil}
                  onChange={onGyldigTilChange}
                  visNavigering={false}
                  ariaLabel="Velg gyldighetsdato"
                  disabled={aktiverLaster}
                />
              </Form.Field>
            </Form.Fields>

            <Form.Actions>
              <ServerFeil feil={aktiverFeil} />
              <Form.Submit
                isLoading={aktiverLaster}
                disabled={!label.trim() || !gyldigTil}
                loadingText="Aktiverer…"
              >
                Aktiver bekreftelse
              </Form.Submit>
            </Form.Actions>
          </Settings.Section>
        </Form>
      ) : (
        <Settings.Section
          eyebrow="Kontroll"
          title="Avslutt medlemsbekreftelsen"
          description="Tidligere bekreftelser beholdes når perioden avsluttes."
          tone="danger"
        >
          <Form.Actions>
            <ServerFeil feil={deaktiverFeil} />
            <Button
              type="button"
              variant="destructive"
              onClick={() => void onDeaktiver()}
              disabled={deaktiverLaster}
            >
              {deaktiverLaster ? "Deaktiverer…" : "Deaktiver bekreftelse"}
            </Button>
          </Form.Actions>
        </Settings.Section>
      )}
    </Settings.Stack>
  );
}
