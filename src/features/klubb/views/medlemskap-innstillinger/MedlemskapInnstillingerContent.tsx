import { CalendarPlus } from "lucide-react";
import {
  AdminFormActions,
  AdminFormSubmitButton,
  AdminSettingsForm,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsValue,
} from "@/components/admin";
import { ServerFeil } from "@/components/errors";
import { RecordStatus } from "@/components/records";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { MedlemskapStatusRespons } from "@/types";

type Props = {
  status: MedlemskapStatusRespons | null;
  label: string;
  onLabelChange: (value: string) => void;
  gyldigTil: string;
  onGyldigTilChange: (value: string) => void;
  onAktiver: () => void;
  aktiverLaster: boolean;
  aktiverFeil: string | null;
  onDeaktiver: () => void;
  deaktiverLaster: boolean;
  deaktiverFeil: string | null;
};

function formaterDato(value: string) {
  return new Date(value).toLocaleDateString("nb-NO");
}

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
    <SettingsStack>
      <SettingsSection
        eyebrow="Medlemskap"
        title="Bekreftelsesperiode"
        description="Følg status og hvor mange som har fullført."
      >
        <SettingsPanel>
          <SettingsRow
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
          </SettingsRow>

          {aktivBekreftelse ? (
            <>
              <SettingsRow title="Startet">
                <SettingsValue>{formaterDato(aktivBekreftelse.opprettetTidspunkt)}</SettingsValue>
              </SettingsRow>
              <SettingsRow title="Gyldig til">
                <SettingsValue>{formaterDato(aktivBekreftelse.gyldigTil)}</SettingsValue>
              </SettingsRow>
              <SettingsRow title="Bekreftet">
                <SettingsValue>
                  {status?.antallBekreftet ?? 0} av {status?.antallTotalt ?? 0} medlemmer
                </SettingsValue>
              </SettingsRow>
            </>
          ) : null}
        </SettingsPanel>
      </SettingsSection>

      {!aktivBekreftelse ? (
        <AdminSettingsForm
          onSubmit={(event) => {
            event.preventDefault();
            onAktiver();
          }}
        >
          <SettingsSection
            eyebrow="Ny periode"
            icon={<CalendarPlus />}
            title="Start medlemsbekreftelse"
            description="Alle medlemmer må bekrefte innen sluttdatoen."
          >
            <SettingsPanel>
              <SettingsRow title="Periodenavn" description='For eksempel "Sesong 2026".'>
                <Field>
                  <Input
                    id="medlemskap-label"
                    aria-label="Periodenavn"
                    value={label}
                    onChange={(event) => onLabelChange(event.target.value)}
                    placeholder="Sesong 2026"
                    maxLength={100}
                    disabled={aktiverLaster}
                  />
                </Field>
              </SettingsRow>

              <SettingsRow title="Gyldig til" description="Dato perioden utløper.">
                <Field>
                  <Input
                    id="medlemskap-gyldig-til"
                    aria-label="Gyldig til"
                    type="date"
                    value={gyldigTil}
                    onChange={(event) => onGyldigTilChange(event.target.value)}
                    disabled={aktiverLaster}
                  />
                </Field>
              </SettingsRow>
            </SettingsPanel>

            <AdminFormActions>
              <ServerFeil feil={aktiverFeil} />
              <AdminFormSubmitButton
                isLoading={aktiverLaster}
                disabled={!label.trim() || !gyldigTil}
                loadingText="Aktiverer…"
              >
                Aktiver bekreftelse
              </AdminFormSubmitButton>
            </AdminFormActions>
          </SettingsSection>
        </AdminSettingsForm>
      ) : (
        <SettingsSection
          eyebrow="Kontroll"
          title="Avslutt medlemsbekreftelsen"
          description="Tidligere bekreftelser beholdes når perioden avsluttes."
          tone="danger"
        >
          <AdminFormActions>
            <ServerFeil feil={deaktiverFeil} />
            <Button
              type="button"
              variant="destructive"
              onClick={() => void onDeaktiver()}
              disabled={deaktiverLaster}
            >
              {deaktiverLaster ? "Deaktiverer…" : "Deaktiver bekreftelse"}
            </Button>
          </AdminFormActions>
        </SettingsSection>
      )}
    </SettingsStack>
  );
}
