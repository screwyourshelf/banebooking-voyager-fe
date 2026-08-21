import { useState } from "react";
import DatoVelger from "@/components/DatoVelger";

import { ServerFeil } from "@/components/errors";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { OpprettKunngjøringForespørsel } from "@/features/kunngjøringer/hooks/useKunngjøringAdmin";
import { tilDatoTekst } from "@/utils/datoUtils";
import { Form, Settings, Dialog } from "@/components";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (request: OpprettKunngjøringForespørsel) => Promise<unknown>;
  isLoading: boolean;
  error: string | null;
};

export default function KunngjøringEditorDialog({
  open,
  onOpenChange,
  onCreate,
  isLoading,
  error,
}: Props) {
  const [tittel, setTittel] = useState("");
  const [tekst, setTekst] = useState("");
  const [utløper, setUtløper] = useState<Date | null>(null);
  const canCreate = Boolean(tittel.trim() && tekst.trim() && utløper);

  function resetForm() {
    setTittel("");
    setTekst("");
    setUtløper(null);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && !isLoading) resetForm();
    onOpenChange(isOpen);
  }

  async function handleSubmit() {
    if (!canCreate || !utløper) return;

    try {
      await onCreate({
        tittel: tittel.trim(),
        tekst: tekst.trim(),
        utløperTidspunkt: new Date(tilDatoTekst(utløper)).toISOString(),
      });
      resetForm();
      onOpenChange(false);
    } catch {
      // Feilen vises i dialogen.
    }
  }

  return (
    <Dialog.Editor
      open={open}
      onOpenChange={handleOpenChange}
      backLabel="Alle kunngjøringer"
      eyebrow="Ny kunngjøring"
      title="Opprett kunngjøring"
      description="Publiser informasjon som brukerne må lese og bekrefte."
      closeDisabled={isLoading}
    >
      <Form
        variant="editor"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <Settings.Stack embedded>
          <Settings.Section
            embedded
            eyebrow="Innhold"
            title="Budskap til medlemmene"
            description="Kunngjøringen sperrer videre bruk av appen til den er bekreftet."
          >
            <Form.Fields>
              <Form.Field
                label="Tittel"
                description="Kort overskrift for kunngjøringen."
                htmlFor="kunngjøring-tittel"
              >
                <Input
                  id="kunngjøring-tittel"
                  aria-label="Tittel"
                  value={tittel}
                  onChange={(event) => setTittel(event.target.value)}
                  placeholder="Viktig informasjon"
                  maxLength={200}
                  disabled={isLoading}
                />
              </Form.Field>

              <Form.Field
                label="Budskap"
                description="Innholdet brukerne må bekrefte."
                htmlFor="kunngjøring-tekst"
              >
                <Textarea
                  id="kunngjøring-tekst"
                  aria-label="Budskap"
                  value={tekst}
                  onChange={(event) => setTekst(event.target.value)}
                  placeholder="Skriv kunngjøringsteksten her…"
                  maxLength={5000}
                  rows={7}
                  disabled={isLoading}
                />
              </Form.Field>

              <Form.Field
                label="Utløpsdato"
                description="Kunngjøringen deaktiveres etter denne datoen."
              >
                <DatoVelger
                  value={utløper}
                  onChange={setUtløper}
                  visNavigering={false}
                  ariaLabel="Velg utløpsdato"
                  disabled={isLoading}
                />
              </Form.Field>
            </Form.Fields>
          </Settings.Section>

          <Form.Actions>
            <ServerFeil feil={error} />
            <Form.Submit isLoading={isLoading} disabled={!canCreate} loadingText="Publiserer…">
              Publiser kunngjøring
            </Form.Submit>
          </Form.Actions>
        </Settings.Stack>
      </Form>
    </Dialog.Editor>
  );
}
