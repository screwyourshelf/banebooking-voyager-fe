import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ServerFeil } from "@/components/errors";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GrenRespons } from "@/types";

type GrenFormData = {
  navn: string;
  banereglement: string;
  aktiv: boolean;
  sortering: string;
  aapningstid: number;
  stengetid: number;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

type Props = {
  grener: GrenRespons[];
  valgtGrenId: string | null;
  onChangeValgtGrenId: (id: string | null) => void;

  valgtGren: GrenRespons | null;
  redigerteVerdier: GrenFormData | null;

  onChangeFelt: (felt: keyof GrenFormData, verdi: string | boolean | number) => void;

  navnError: string | null;
  onBlurNavn: () => void;

  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  mutasjonFeil?: string | null;
};

function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

const slotValues = [30, 45, 60, 90];

function slotLabel(min: number) {
  return `${min} min`;
}

export default function RedigerGrenContent({
  grener,
  valgtGrenId,
  onChangeValgtGrenId,
  valgtGren,
  redigerteVerdier,
  onChangeFelt,
  navnError,
  onBlurNavn,
  canSubmit,
  isSaving,
  onSubmit,
  mutasjonFeil,
}: Props) {
  const navn = redigerteVerdier?.navn ?? valgtGren?.navn ?? "";
  const banereglement = redigerteVerdier?.banereglement ?? valgtGren?.banereglement ?? "";
  const aktiv = redigerteVerdier?.aktiv ?? valgtGren?.aktiv ?? false;
  const sortering = redigerteVerdier?.sortering ?? String(valgtGren?.sortering ?? 0);

  const aapningstid =
    redigerteVerdier?.aapningstid ??
    (valgtGren ? timeToHour(valgtGren.bookingInnstillinger.aapningstid) : 7);
  const stengetid =
    redigerteVerdier?.stengetid ??
    (valgtGren ? timeToHour(valgtGren.bookingInnstillinger.stengetid) : 22);
  const maksPerDag =
    redigerteVerdier?.maksPerDag ?? valgtGren?.bookingInnstillinger.maksPerDag ?? 2;
  const maksTotalt =
    redigerteVerdier?.maksTotalt ?? valgtGren?.bookingInnstillinger.maksTotalt ?? 5;
  const dagerFremITid =
    redigerteVerdier?.dagerFremITid ?? valgtGren?.bookingInnstillinger.dagerFremITid ?? 7;
  const slotLengdeMinutter =
    redigerteVerdier?.slotLengdeMinutter ??
    valgtGren?.bookingInnstillinger.slotLengdeMinutter ??
    60;

  const slotIndex = Math.max(0, slotValues.indexOf(slotLengdeMinutter));
  const anyActionPending = isSaving;

  return (
    <FormLayout
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <PageSection title="Rediger gren">
        <RowPanel>
          <RowList>
            <Row title="Velg gren">
              <Field>
                <Select
                  disabled={anyActionPending}
                  value={valgtGrenId ?? ""}
                  onValueChange={(val) => onChangeValgtGrenId(val || null)}
                >
                  <SelectTrigger id="velg-gren" className="bg-background">
                    <SelectValue placeholder="Velg gren..." />
                  </SelectTrigger>

                  <SelectContent>
                    {grener.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.navn} {g.aktiv ? "" : "(inaktiv)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Row>

            {valgtGren ? (
              <>
                <Row title="Navn" description="F.eks. Tennis, Padel.">
                  <Field data-invalid={!!navnError}>
                    <Input
                      id="navn"
                      disabled={anyActionPending}
                      value={navn}
                      onChange={(e) => onChangeFelt("navn", e.target.value)}
                      onBlur={onBlurNavn}
                      aria-invalid={!!navnError}
                      autoComplete="off"
                    />
                    {navnError ? <FieldError>{navnError}</FieldError> : null}
                  </Field>
                </Row>

                <Row title="Banereglement" description="Valgfritt. Vises i bookingvisningen.">
                  <Field>
                    <Textarea
                      id="banereglement"
                      disabled={anyActionPending}
                      value={banereglement}
                      onChange={(e) => onChangeFelt("banereglement", e.target.value)}
                      rows={4}
                    />
                  </Field>
                </Row>

                <Row title="Sortering" description="Lave tall vises først. Standard: 0.">
                  <Field>
                    <Input
                      id="sortering"
                      type="number"
                      disabled={anyActionPending}
                      value={sortering}
                      onChange={(e) => onChangeFelt("sortering", e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                </Row>

                <Row
                  title="Aktiv"
                  description="Bestemmer om grenen vises i bookingvisningen."
                  right={
                    <Switch
                      disabled={anyActionPending}
                      checked={aktiv}
                      onCheckedChange={(checked) => onChangeFelt("aktiv", checked)}
                    />
                  }
                />
              </>
            ) : (
              <Row title="Ingen grener funnet">
                <div className="text-sm text-muted-foreground italic">
                  Det finnes ingen grener å redigere.
                </div>
              </Row>
            )}
          </RowList>
        </RowPanel>
      </PageSection>

      {valgtGren && (
        <PageSection
          title="Bookinginnstillinger"
          description="Styr åpningstider og bookinggrenser for denne grenen."
        >
          <RowPanel>
            <RowList>
              <Row
                title="Åpningstid"
                description="Tidligste starttidspunkt."
                right={
                  <div className="text-sm font-medium tabular-nums">{hourLabel(aapningstid)}</div>
                }
              >
                <Field>
                  <input
                    type="range"
                    value={aapningstid}
                    min={6}
                    max={23}
                    step={1}
                    onChange={(e) => onChangeFelt("aapningstid", Number(e.target.value))}
                    className="w-full accent-primary"
                    disabled={anyActionPending}
                  />
                </Field>
              </Row>

              <Row
                title="Stengetid"
                description="Seneste starttidspunkt."
                right={
                  <div className="text-sm font-medium tabular-nums">{hourLabel(stengetid)}</div>
                }
              >
                <Field>
                  <input
                    type="range"
                    value={stengetid}
                    min={6}
                    max={23}
                    step={1}
                    onChange={(e) => onChangeFelt("stengetid", Number(e.target.value))}
                    className="w-full accent-primary"
                    disabled={anyActionPending}
                  />
                </Field>
              </Row>

              <Row
                title="Maks bookinger per dag"
                description="Per bruker."
                right={<div className="text-sm font-medium tabular-nums">{maksPerDag}</div>}
              >
                <Field>
                  <input
                    type="range"
                    value={maksPerDag}
                    min={0}
                    max={5}
                    step={1}
                    onChange={(e) => onChangeFelt("maksPerDag", Number(e.target.value))}
                    className="w-full accent-primary"
                    disabled={anyActionPending}
                  />
                </Field>
              </Row>

              <Row
                title="Maks aktive bookinger"
                description="Per bruker (totalt)."
                right={<div className="text-sm font-medium tabular-nums">{maksTotalt}</div>}
              >
                <Field>
                  <input
                    type="range"
                    value={maksTotalt}
                    min={0}
                    max={10}
                    step={1}
                    onChange={(e) => onChangeFelt("maksTotalt", Number(e.target.value))}
                    className="w-full accent-primary"
                    disabled={anyActionPending}
                  />
                </Field>
              </Row>

              <Row
                title="Hvor langt frem du kan booke"
                description="Antall dager frem i tid."
                right={<div className="text-sm font-medium tabular-nums">{dagerFremITid}</div>}
              >
                <Field>
                  <input
                    type="range"
                    value={dagerFremITid}
                    min={1}
                    max={14}
                    step={1}
                    onChange={(e) => onChangeFelt("dagerFremITid", Number(e.target.value))}
                    className="w-full accent-primary"
                    disabled={anyActionPending}
                  />
                </Field>
              </Row>

              <Row
                title="Slot-lengde"
                description="Lengde på hver booking."
                right={
                  <div className="text-sm font-medium tabular-nums">
                    {slotLabel(slotLengdeMinutter)}
                  </div>
                }
              >
                <Field>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={0}
                      max={slotValues.length - 1}
                      step={1}
                      value={slotIndex}
                      onChange={(e) => {
                        const index = Number(e.target.value);
                        const minutes = slotValues[index];
                        onChangeFelt("slotLengdeMinutter", minutes);
                      }}
                      className="w-full accent-primary"
                      disabled={anyActionPending}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      {slotValues.map((v) => (
                        <span key={v}>{v}</span>
                      ))}
                    </div>
                  </div>
                </Field>
              </Row>
            </RowList>
          </RowPanel>
        </PageSection>
      )}

      <FormActions variant="sticky" align="left" spaced={false} className="w-full">
        <ServerFeil feil={mutasjonFeil} />
        <FormSubmitButton
          fullWidth
          isLoading={isSaving}
          disabled={!canSubmit}
          loadingText="Lagrer..."
        >
          Lagre
        </FormSubmitButton>
      </FormActions>
    </FormLayout>
  );
}

function timeToHour(t: string): number {
  const h = parseInt((t ?? "").split(":")[0] ?? "0", 10);
  return Number.isFinite(h) ? h : 0;
}
