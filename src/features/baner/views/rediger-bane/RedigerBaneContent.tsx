import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import SwitchRow from "@/components/rows/SwitchRow";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaneRespons, BookingRegelRespons } from "@/types";

type BaneFormData = {
  navn: string;
  beskrivelse: string;
  aktiv: boolean;
  sortering: string;
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
  baner: BaneRespons[];
  valgtBaneId: string | null;
  onChangeValgtBaneId: (id: string | null) => void;

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
};

function hourLabel(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

/* slot mapping */
const slotValues = [30, 45, 60, 90];

function slotLabel(min: number) {
  return `${min} min`;
}

export default function RedigerBaneContent({
  baner,
  valgtBaneId,
  onChangeValgtBaneId,
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
}: Props) {
  const navn = redigerteVerdier?.navn ?? valgtBane?.navn ?? "";
  const beskrivelse = redigerteVerdier?.beskrivelse ?? valgtBane?.beskrivelse ?? "";
  const aktiv = redigerteVerdier?.aktiv ?? valgtBane?.aktiv ?? false;
  const sortering = redigerteVerdier?.sortering ?? String(valgtBane?.sortering ?? 0);

  return (
    <FormLayout
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <PageSection title="Rediger bane">
        <RowPanel>
          <RowList>
            <Row title="Velg bane">
              <Field>
                <Select
                  disabled={isSaving}
                  value={valgtBaneId ?? ""}
                  onValueChange={(val) => onChangeValgtBaneId(val || null)}
                >
                  <SelectTrigger id="velg-bane" className="bg-background">
                    <SelectValue placeholder="Velg bane..." />
                  </SelectTrigger>

                  <SelectContent>
                    {baner.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.navn} {b.aktiv ? "" : "(inaktiv)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Row>

            {valgtBane ? (
              <>
                <Row title="Navn" description="Vises i bookingvisningen.">
                  <Field data-invalid={!!navnError}>
                    <Input
                      id="navn"
                      disabled={isSaving}
                      value={navn}
                      onChange={(e) => onChangeFelt("navn", e.target.value)}
                      onBlur={onBlurNavn}
                      aria-invalid={!!navnError}
                      autoComplete="off"
                    />
                    {navnError ? <FieldError>{navnError}</FieldError> : null}
                  </Field>
                </Row>

                <Row title="Beskrivelse" description="Valgfritt.">
                  <Field>
                    <Input
                      id="beskrivelse"
                      disabled={isSaving}
                      value={beskrivelse}
                      onChange={(e) => onChangeFelt("beskrivelse", e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                </Row>

                <Row title="Sortering" description="Lave tall vises først. Standard: 0.">
                  <Field>
                    <Input
                      id="sortering"
                      type="number"
                      disabled={isSaving}
                      value={sortering}
                      onChange={(e) => onChangeFelt("sortering", e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                </Row>

                <Row
                  title="Aktiv"
                  description="Bestemmer om banen kan bookes."
                  right={
                    <Switch
                      disabled={isSaving}
                      checked={aktiv}
                      onCheckedChange={(checked) => onChangeFelt("aktiv", checked)}
                    />
                  }
                />

                <Row
                  title="Overstyr bookinginnstillinger"
                  right={
                    <Switch
                      disabled={isSaving}
                      checked={overstyringAktivert}
                      onCheckedChange={onToggleOverstyringAktivert}
                    />
                  }
                />
              </>
            ) : (
              <Row title="Ingen baner funnet">
                <div className="text-sm text-muted-foreground italic">
                  Det finnes ingen baner å redigere.
                </div>
              </Row>
            )}
          </RowList>
        </RowPanel>
      </PageSection>

      {valgtBane && overstyringAktivert && klubbDefault && overstyring && (
        <PageSection
          title="Bookinginnstillinger"
          description="Felter som ikke er overstyrt arves fra klubben."
        >
          <RowPanel>
            <RowList>
              <SwitchRow
                title="Overstyr åpningstid"
                description={`Klubb-default: ${klubbDefault.aapningstid}`}
                checked={overstyring.aapningstid !== null}
                onCheckedChange={(v) => onToggleOverstyring("aapningstid", v)}
                disabled={isSaving}
              />
              {overstyring.aapningstid !== null && (
                <Row
                  title="Åpningstid"
                  right={
                    <div className="text-sm font-medium tabular-nums">
                      {hourLabel(overstyring.aapningstid)}
                    </div>
                  }
                >
                  <Field>
                    <input
                      type="range"
                      value={overstyring.aapningstid}
                      min={6}
                      max={23}
                      step={1}
                      onChange={(e) => onChangeOverstyring("aapningstid", Number(e.target.value))}
                      className="w-full accent-primary"
                      disabled={isSaving}
                    />
                  </Field>
                </Row>
              )}

              <SwitchRow
                title="Overstyr stengetid"
                description={`Klubb-default: ${klubbDefault.stengetid}`}
                checked={overstyring.stengetid !== null}
                onCheckedChange={(v) => onToggleOverstyring("stengetid", v)}
                disabled={isSaving}
              />
              {overstyring.stengetid !== null && (
                <Row
                  title="Stengetid"
                  right={
                    <div className="text-sm font-medium tabular-nums">
                      {hourLabel(overstyring.stengetid)}
                    </div>
                  }
                >
                  <Field>
                    <input
                      type="range"
                      value={overstyring.stengetid}
                      min={6}
                      max={23}
                      step={1}
                      onChange={(e) => onChangeOverstyring("stengetid", Number(e.target.value))}
                      className="w-full accent-primary"
                      disabled={isSaving}
                    />
                  </Field>
                </Row>
              )}

              <SwitchRow
                title="Overstyr maks per dag"
                description={`Klubb-default: ${klubbDefault.maksPerDag}`}
                checked={overstyring.maksPerDag !== null}
                onCheckedChange={(v) => onToggleOverstyring("maksPerDag", v)}
                disabled={isSaving}
              />
              {overstyring.maksPerDag !== null && (
                <Row
                  title="Maks bookinger per dag"
                  right={
                    <div className="text-sm font-medium tabular-nums">{overstyring.maksPerDag}</div>
                  }
                >
                  <Field>
                    <input
                      type="range"
                      value={overstyring.maksPerDag}
                      min={0}
                      max={5}
                      step={1}
                      onChange={(e) => onChangeOverstyring("maksPerDag", Number(e.target.value))}
                      className="w-full accent-primary"
                      disabled={isSaving}
                    />
                  </Field>
                </Row>
              )}

              <SwitchRow
                title="Overstyr maks aktive bookinger"
                description={`Klubb-default: ${klubbDefault.maksTotalt}`}
                checked={overstyring.maksTotalt !== null}
                onCheckedChange={(v) => onToggleOverstyring("maksTotalt", v)}
                disabled={isSaving}
              />
              {overstyring.maksTotalt !== null && (
                <Row
                  title="Maks aktive bookinger"
                  right={
                    <div className="text-sm font-medium tabular-nums">{overstyring.maksTotalt}</div>
                  }
                >
                  <Field>
                    <input
                      type="range"
                      value={overstyring.maksTotalt}
                      min={0}
                      max={10}
                      step={1}
                      onChange={(e) => onChangeOverstyring("maksTotalt", Number(e.target.value))}
                      className="w-full accent-primary"
                      disabled={isSaving}
                    />
                  </Field>
                </Row>
              )}

              <SwitchRow
                title="Overstyr dager frem i tid"
                description={`Klubb-default: ${klubbDefault.dagerFremITid}`}
                checked={overstyring.dagerFremITid !== null}
                onCheckedChange={(v) => onToggleOverstyring("dagerFremITid", v)}
                disabled={isSaving}
              />
              {overstyring.dagerFremITid !== null && (
                <Row
                  title="Dager frem i tid"
                  right={
                    <div className="text-sm font-medium tabular-nums">
                      {overstyring.dagerFremITid}
                    </div>
                  }
                >
                  <Field>
                    <input
                      type="range"
                      value={overstyring.dagerFremITid}
                      min={1}
                      max={14}
                      step={1}
                      onChange={(e) => onChangeOverstyring("dagerFremITid", Number(e.target.value))}
                      className="w-full accent-primary"
                      disabled={isSaving}
                    />
                  </Field>
                </Row>
              )}

              <SwitchRow
                title="Overstyr slot-lengde"
                description={`Klubb-default: ${klubbDefault.slotLengdeMinutter} min`}
                checked={overstyring.slotLengdeMinutter !== null}
                onCheckedChange={(v) => onToggleOverstyring("slotLengdeMinutter", v)}
                disabled={isSaving}
              />
              {overstyring.slotLengdeMinutter !== null && (
                <Row
                  title="Slot-lengde"
                  right={
                    <div className="text-sm font-medium tabular-nums">
                      {slotLabel(overstyring.slotLengdeMinutter)}
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
                        value={Math.max(0, slotValues.indexOf(overstyring.slotLengdeMinutter))}
                        onChange={(e) => {
                          const index = Number(e.target.value);
                          const minutes = slotValues[index];
                          onChangeOverstyring("slotLengdeMinutter", minutes);
                        }}
                        className="w-full accent-primary"
                        disabled={isSaving}
                      />

                      {/* labels under slider */}
                      <div className="flex justify-between text-xs text-muted-foreground px-1">
                        {slotValues.map((v) => (
                          <span key={v}>{v}</span>
                        ))}
                      </div>
                    </div>
                  </Field>
                </Row>
              )}
            </RowList>
          </RowPanel>
        </PageSection>
      )}

      <FormActions variant="sticky" align="left" spaced={false} className="w-full">
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
