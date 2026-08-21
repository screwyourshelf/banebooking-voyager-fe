import { Form, Settings } from "@/components";

import { MutationFeedback } from "@/components/feedback";
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
  const grenId = redigerteVerdier?.grenId ?? valgtBane?.grenId ?? "";
  const grenNavn = grener.find((gren) => gren.id === grenId)?.navn;

  return (
    <Form
      variant="editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {valgtBane ? (
        <Settings.Stack embedded>
          <Settings.Section
            embedded
            eyebrow="Bane"
            title="Baneinformasjon"
            description="Det medlemmene kjenner igjen i bookingoversikten."
          >
            <Form.Fields>
              <Form.Field label="Navn" htmlFor="navn" error={navnError}>
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
              </Form.Field>

              <Form.Field label="Gren" htmlFor="rediger-grenId">
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
              </Form.Field>

              <Form.Field label="Beskrivelse" htmlFor="beskrivelse">
                <Input
                  id="beskrivelse"
                  aria-label="Beskrivelse"
                  placeholder="For eksempel nær klubbhuset"
                  disabled={isSaving}
                  value={beskrivelse}
                  onChange={(event) => onChangeFelt("beskrivelse", event.target.value)}
                  autoComplete="off"
                />
              </Form.Field>
            </Form.Fields>
          </Settings.Section>

          <Settings.Section
            embedded
            eyebrow="Booking"
            title="Tilgjengelighet"
            description="Styr om banen kan bookes og om den avviker fra grenens standard."
          >
            <Settings.Panel>
              <Settings.SwitchRow
                title="Aktiv"
                checked={aktiv}
                onCheckedChange={(checked) => onChangeFelt("aktiv", checked)}
                disabled={isSaving}
              />

              <Settings.SwitchRow
                title="Egne bookingregler"
                description={grenNavn ? `Avvik fra standard for ${grenNavn}.` : undefined}
                checked={overstyringAktivert}
                onCheckedChange={onToggleOverstyringAktivert}
                disabled={isSaving}
              />
            </Settings.Panel>
          </Settings.Section>

          {overstyringAktivert && klubbDefault && overstyring ? (
            <Settings.Section
              embedded
              eyebrow="Avvik"
              title="Bookingregler"
              description="Bare aktiver verdiene som skal avvike fra grenens standard."
            >
              <Settings.Panel>
                <Settings.SwitchRow
                  title="Egen åpningstid"
                  description={`Standard: ${klubbDefault.aapningstid}`}
                  checked={overstyring.aapningstid !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("aapningstid", checked)}
                  disabled={isSaving}
                />
                {overstyring.aapningstid !== null ? (
                  <Settings.Row
                    title="Åpningstid"
                    right={<Settings.Value>{hourLabel(overstyring.aapningstid)}</Settings.Value>}
                  >
                    <Settings.Range
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
                  </Settings.Row>
                ) : null}

                <Settings.SwitchRow
                  title="Egen stengetid"
                  description={`Standard: ${klubbDefault.stengetid}`}
                  checked={overstyring.stengetid !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("stengetid", checked)}
                  disabled={isSaving}
                />
                {overstyring.stengetid !== null ? (
                  <Settings.Row
                    title="Stengetid"
                    right={<Settings.Value>{hourLabel(overstyring.stengetid)}</Settings.Value>}
                  >
                    <Settings.Range
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
                  </Settings.Row>
                ) : null}

                <Settings.SwitchRow
                  title="Egen grense per dag"
                  description={`Standard: ${klubbDefault.maksPerDag}`}
                  checked={overstyring.maksPerDag !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("maksPerDag", checked)}
                  disabled={isSaving}
                />
                {overstyring.maksPerDag !== null ? (
                  <Settings.Row
                    title="Maks bookinger per dag"
                    right={<Settings.Value>{overstyring.maksPerDag}</Settings.Value>}
                  >
                    <Settings.Range
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
                  </Settings.Row>
                ) : null}

                <Settings.SwitchRow
                  title="Egen grense for aktive bookinger"
                  description={`Standard: ${klubbDefault.maksTotalt}`}
                  checked={overstyring.maksTotalt !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("maksTotalt", checked)}
                  disabled={isSaving}
                />
                {overstyring.maksTotalt !== null ? (
                  <Settings.Row
                    title="Maks aktive bookinger"
                    right={<Settings.Value>{overstyring.maksTotalt}</Settings.Value>}
                  >
                    <Settings.Range
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
                  </Settings.Row>
                ) : null}

                <Settings.SwitchRow
                  title="Egen bookinghorisont"
                  description={`Standard: ${klubbDefault.dagerFremITid} dager`}
                  checked={overstyring.dagerFremITid !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("dagerFremITid", checked)}
                  disabled={isSaving}
                />
                {overstyring.dagerFremITid !== null ? (
                  <Settings.Row
                    title="Dager frem i tid"
                    right={<Settings.Value>{overstyring.dagerFremITid}</Settings.Value>}
                  >
                    <Settings.Range
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
                  </Settings.Row>
                ) : null}

                <Settings.SwitchRow
                  title="Egen lengde på tider"
                  description={`Standard: ${klubbDefault.slotLengdeMinutter} min`}
                  checked={overstyring.slotLengdeMinutter !== null}
                  onCheckedChange={(checked) => onToggleOverstyring("slotLengdeMinutter", checked)}
                  disabled={isSaving}
                />
                {overstyring.slotLengdeMinutter !== null ? (
                  <Settings.Row
                    title="Lengde på tider"
                    right={
                      <Settings.Value>{slotLabel(overstyring.slotLengdeMinutter)}</Settings.Value>
                    }
                  >
                    <Settings.Range
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
                  </Settings.Row>
                ) : null}
              </Settings.Panel>
            </Settings.Section>
          ) : null}

          <Form.Actions>
            <MutationFeedback
              error={mutasjonFeil}
              success={lagret}
              successTitle="Baneinnstillingene er lagret"
            />
            <Form.Submit isLoading={isSaving} disabled={!canSubmit} loadingText="Lagrer…">
              Lagre endringer
            </Form.Submit>
          </Form.Actions>
        </Settings.Stack>
      ) : null}
    </Form>
  );
}
