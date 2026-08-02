import { CalendarClock, MapPin, SlidersHorizontal } from "lucide-react";
import {
  AdminEditorForm,
  AdminFormActions,
  AdminFormSubmitButton,
  SettingsPanel,
  SettingsRange,
  SettingsRow,
  SettingsSection,
  SettingsStack,
  SettingsSwitchRow,
  SettingsValue,
} from "@/components/admin";
import { MutationFeedback } from "@/components/feedback";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaneRespons, BookingRegelRespons, GrenRespons } from "@/types";

type BaneFormData = {
  navn: string;
  beskrivelse: string;
  aktiv: boolean;
  sortering: string;
  grenId: string;
};

type OverstyringFormData = {
  aapningstid: number | null;
  stengetid: number | null;
  slotLengdeMinutter: number | null;
  maksPerDag: number | null;
  maksTotalt: number | null;
  dagerFremITid: number | null;
};

type Props = {
  grener: GrenRespons[];
  valgtBane: BaneRespons | null;
  redigerteVerdier: BaneFormData | null;
  onChangeFelt: (felt: keyof BaneFormData, verdi: string | boolean) => void;
  navnError: string | null;
  onBlurNavn: () => void;
  overstyringAktivert: boolean;
  onToggleOverstyringAktivert: (aktiv: boolean) => void;
  klubbDefault: BookingRegelRespons | null;
  overstyring: OverstyringFormData | null;
  onToggleOverstyring: (felt: keyof OverstyringFormData, aktiv: boolean) => void;
  onChangeOverstyring: (felt: keyof OverstyringFormData, verdi: number) => void;
  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  mutasjonFeil?: string | null;
  lagret?: boolean;
};

const slotValues = [30, 45, 60, 90];

function hourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function slotLabel(minutes: number) {
  return `${minutes} min`;
}

export default function RedigerBaneContent({
  grener,
  valgtBane,
  redigerteVerdier,
  onChangeFelt,
  navnError,
  onBlurNavn,
  overstyringAktivert,
  onToggleOverstyringAktivert,
  klubbDefault,
  overstyring,
  onToggleOverstyring,
  onChangeOverstyring,
  canSubmit,
  isSaving,
  onSubmit,
  mutasjonFeil,
  lagret = false,
}: Props) {
  const navn = redigerteVerdier?.navn ?? valgtBane?.navn ?? "";
  const beskrivelse = redigerteVerdier?.beskrivelse ?? valgtBane?.beskrivelse ?? "";
  const aktiv = redigerteVerdier?.aktiv ?? valgtBane?.aktiv ?? false;
  const sortering = redigerteVerdier?.sortering ?? String(valgtBane?.sortering ?? 0);
  const grenId = redigerteVerdier?.grenId ?? valgtBane?.grenId ?? "";
  const grenNavn = grener.find((gren) => gren.id === grenId)?.navn;

  return (
    <AdminEditorForm
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {valgtBane ? (
        <SettingsStack embedded>
          <SettingsSection
            embedded
            eyebrow="Bane"
            icon={<MapPin />}
            title="Baneinformasjon"
            description="Det medlemmene kjenner igjen i bookingoversikten."
          >
            <SettingsPanel>
              <SettingsRow title="Navn">
                <Field data-invalid={!!navnError}>
                  <Input
                    id="navn"
                    aria-label="Navn"
                    placeholder="For eksempel Bane A"
                    disabled={isSaving}
                    value={navn}
                    onChange={(event) => onChangeFelt("navn", event.target.value)}
                    onBlur={onBlurNavn}
                    aria-invalid={!!navnError}
                    autoComplete="off"
                  />
                  {navnError ? <FieldError>{navnError}</FieldError> : null}
                </Field>
              </SettingsRow>

              <SettingsRow title="Gren">
                <Field>
                  <Select
                    disabled={isSaving}
                    value={grenId}
                    onValueChange={(value) => onChangeFelt("grenId", value)}
                  >
                    <SelectTrigger id="rediger-grenId" aria-label="Gren">
                      <SelectValue placeholder="Velg gren…" />
                    </SelectTrigger>
                    <SelectContent>
                      {grener.map((gren) => (
                        <SelectItem key={gren.id} value={gren.id}>
                          {gren.navn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </SettingsRow>

              <SettingsRow title="Beskrivelse">
                <Field>
                  <Input
                    id="beskrivelse"
                    aria-label="Beskrivelse"
                    placeholder="For eksempel nær klubbhuset"
                    disabled={isSaving}
                    value={beskrivelse}
                    onChange={(event) => onChangeFelt("beskrivelse", event.target.value)}
                    autoComplete="off"
                  />
                </Field>
              </SettingsRow>

              <SettingsRow title="Sortering" description="Lavest vises først.">
                <Field>
                  <Input
                    id="sortering"
                    aria-label="Sortering"
                    type="number"
                    disabled={isSaving}
                    value={sortering}
                    onChange={(event) => onChangeFelt("sortering", event.target.value)}
                    autoComplete="off"
                  />
                </Field>
              </SettingsRow>
            </SettingsPanel>
          </SettingsSection>

          <SettingsSection
            embedded
            eyebrow="Booking"
            icon={<CalendarClock />}
            title="Tilgjengelighet"
            description="Styr om banen kan bookes og om den avviker fra grenens standard."
          >
            <SettingsPanel>
              <SettingsSwitchRow
                title="Aktiv"
                checked={aktiv}
                onCheckedChange={(checked) => onChangeFelt("aktiv", checked)}
                disabled={isSaving}
              />

              <SettingsSwitchRow
                title="Egne bookingregler"
                description={grenNavn ? `Avvik fra standard for ${grenNavn}.` : undefined}
                checked={overstyringAktivert}
                onCheckedChange={onToggleOverstyringAktivert}
                disabled={isSaving}
              />
            </SettingsPanel>
          </SettingsSection>

          {overstyringAktivert && klubbDefault && overstyring ? (
            <SettingsSection
              embedded
              eyebrow="Avvik"
              icon={<SlidersHorizontal />}
              title="Bookingregler"
              description="Bare aktiver verdiene som skal avvike fra grenens standard."
            >
              <SettingsPanel>
                <SettingsSwitchRow
                  title="Egen åpningstid"
                  description={`Standard: ${klubbDefault.aapningstid}`}
                  checked={overstyring.aapningstid !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("aapningstid", checked)}
                  disabled={isSaving}
                />
                {overstyring.aapningstid !== null ? (
                  <SettingsRow
                    title="Åpningstid"
                    right={<SettingsValue>{hourLabel(overstyring.aapningstid)}</SettingsValue>}
                  >
                    <SettingsRange
                      aria-label="Åpningstid"
                      value={overstyring.aapningstid}
                      min={6}
                      max={23}
                      step={1}
                      onChange={(event) =>
                        onChangeOverstyring("aapningstid", Number(event.target.value))
                      }
                      disabled={isSaving}
                    />
                  </SettingsRow>
                ) : null}

                <SettingsSwitchRow
                  title="Egen stengetid"
                  description={`Standard: ${klubbDefault.stengetid}`}
                  checked={overstyring.stengetid !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("stengetid", checked)}
                  disabled={isSaving}
                />
                {overstyring.stengetid !== null ? (
                  <SettingsRow
                    title="Stengetid"
                    right={<SettingsValue>{hourLabel(overstyring.stengetid)}</SettingsValue>}
                  >
                    <SettingsRange
                      aria-label="Stengetid"
                      value={overstyring.stengetid}
                      min={6}
                      max={23}
                      step={1}
                      onChange={(event) =>
                        onChangeOverstyring("stengetid", Number(event.target.value))
                      }
                      disabled={isSaving}
                    />
                  </SettingsRow>
                ) : null}

                <SettingsSwitchRow
                  title="Egen grense per dag"
                  description={`Standard: ${klubbDefault.maksPerDag}`}
                  checked={overstyring.maksPerDag !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("maksPerDag", checked)}
                  disabled={isSaving}
                />
                {overstyring.maksPerDag !== null ? (
                  <SettingsRow
                    title="Maks bookinger per dag"
                    right={<SettingsValue>{overstyring.maksPerDag}</SettingsValue>}
                  >
                    <SettingsRange
                      aria-label="Maks bookinger per dag"
                      value={overstyring.maksPerDag}
                      min={0}
                      max={5}
                      step={1}
                      onChange={(event) =>
                        onChangeOverstyring("maksPerDag", Number(event.target.value))
                      }
                      disabled={isSaving}
                    />
                  </SettingsRow>
                ) : null}

                <SettingsSwitchRow
                  title="Egen grense for aktive bookinger"
                  description={`Standard: ${klubbDefault.maksTotalt}`}
                  checked={overstyring.maksTotalt !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("maksTotalt", checked)}
                  disabled={isSaving}
                />
                {overstyring.maksTotalt !== null ? (
                  <SettingsRow
                    title="Maks aktive bookinger"
                    right={<SettingsValue>{overstyring.maksTotalt}</SettingsValue>}
                  >
                    <SettingsRange
                      aria-label="Maks aktive bookinger"
                      value={overstyring.maksTotalt}
                      min={0}
                      max={10}
                      step={1}
                      onChange={(event) =>
                        onChangeOverstyring("maksTotalt", Number(event.target.value))
                      }
                      disabled={isSaving}
                    />
                  </SettingsRow>
                ) : null}

                <SettingsSwitchRow
                  title="Egen bookinghorisont"
                  description={`Standard: ${klubbDefault.dagerFremITid} dager`}
                  checked={overstyring.dagerFremITid !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("dagerFremITid", checked)}
                  disabled={isSaving}
                />
                {overstyring.dagerFremITid !== null ? (
                  <SettingsRow
                    title="Dager frem i tid"
                    right={<SettingsValue>{overstyring.dagerFremITid}</SettingsValue>}
                  >
                    <SettingsRange
                      aria-label="Dager frem i tid"
                      value={overstyring.dagerFremITid}
                      min={1}
                      max={14}
                      step={1}
                      onChange={(event) =>
                        onChangeOverstyring("dagerFremITid", Number(event.target.value))
                      }
                      disabled={isSaving}
                    />
                  </SettingsRow>
                ) : null}

                <SettingsSwitchRow
                  title="Egen lengde på tider"
                  description={`Standard: ${klubbDefault.slotLengdeMinutter} min`}
                  checked={overstyring.slotLengdeMinutter !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("slotLengdeMinutter", checked)}
                  disabled={isSaving}
                />
                {overstyring.slotLengdeMinutter !== null ? (
                  <SettingsRow
                    title="Lengde på tider"
                    right={
                      <SettingsValue>{slotLabel(overstyring.slotLengdeMinutter)}</SettingsValue>
                    }
                  >
                    <SettingsRange
                      aria-label="Lengde på tider"
                      min={0}
                      max={slotValues.length - 1}
                      step={1}
                      value={Math.max(0, slotValues.indexOf(overstyring.slotLengdeMinutter))}
                      onChange={(event) => {
                        const minutes = slotValues[Number(event.target.value)];
                        onChangeOverstyring("slotLengdeMinutter", minutes);
                      }}
                      disabled={isSaving}
                      labels={
                        <>
                          {slotValues.map((value) => (
                            <span key={value}>{value}</span>
                          ))}
                        </>
                      }
                    />
                  </SettingsRow>
                ) : null}
              </SettingsPanel>
            </SettingsSection>
          ) : null}

          <AdminFormActions>
            <MutationFeedback
              error={mutasjonFeil}
              success={lagret}
              successTitle="Baneinnstillingene er lagret"
            />
            <AdminFormSubmitButton isLoading={isSaving} disabled={!canSubmit} loadingText="Lagrer…">
              Lagre endringer
            </AdminFormSubmitButton>
          </AdminFormActions>
        </SettingsStack>
      ) : null}
    </AdminEditorForm>
  );
}
