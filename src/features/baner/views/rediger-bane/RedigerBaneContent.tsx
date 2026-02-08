import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
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
import type { BaneRespons } from "@/types";

type BaneFormData = {
  navn: string;
  beskrivelse: string;
  aktiv: boolean;
};

type Props = {
  baner: BaneRespons[];
  valgtBaneId: string | null;
  onChangeValgtBaneId: (id: string | null) => void;

  valgtBane: BaneRespons | null;
  redigerteVerdier: BaneFormData | null;

  onChangeFelt: (felt: keyof BaneFormData, verdi: string | boolean) => void;

  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;

  navnError: string | null;
  onBlurNavn: () => void;
};

export default function RedigerBaneContent({
  baner,
  valgtBaneId,
  onChangeValgtBaneId,
  valgtBane,
  redigerteVerdier,
  onChangeFelt,
  canSubmit,
  isSaving,
  onSubmit,
  navnError,
  onBlurNavn,
}: Props) {
  const navn = redigerteVerdier?.navn ?? valgtBane?.navn ?? "";
  const beskrivelse = redigerteVerdier?.beskrivelse ?? valgtBane?.beskrivelse ?? "";
  const aktiv = redigerteVerdier?.aktiv ?? valgtBane?.aktiv ?? false;

  return (
    <FormLayout
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <PageSection title="Rediger bane" description="Velg en bane og oppdater informasjon.">
        <RowPanel>
          <RowList>
            <Row title="Velg bane" description="Velg hvilken bane du vil endre.">
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
                <Row title="Navn" description="Navn på banen slik det vises i booking.">
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

                <Row
                  title="Aktiv"
                  description="Avgjør om banen er tilgjengelig for booking."
                  right={
                    <Switch
                      disabled={isSaving}
                      checked={aktiv}
                      onCheckedChange={(checked) => onChangeFelt("aktiv", checked)}
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
