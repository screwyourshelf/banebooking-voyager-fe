import { useState } from "react";
import DatoVelger from "@/components/DatoVelger";

import { ServerFeil } from "@/components/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SperrBrukerForespørsel } from "@/types";
import { Form, Settings, Dialog } from "@/components";

type Props = {
  brukerEpost: string;
  onSperr: (data: SperrBrukerForespørsel) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  serverFeil?: string | null;
};

export default function SperrBrukerDialog({
  brukerEpost,
  onSperr,
  disabled = false,
  isLoading = false,
  serverFeil = null,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [årsak, setÅrsak] = useState("");
  const [aktivTil, setAktivTil] = useState<Date | null>(null);
  const loading = isBusy || isLoading;

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setÅrsak("");
      setAktivTil(null);
    }
    setOpen(isOpen);
  }

  async function handleSperr() {
    setIsBusy(true);
    try {
      await onSperr({
        type: "ManuellSperre",
        årsak: årsak.trim(),
        aktivTil: aktivTil ? aktivTil.toISOString() : null,
      });
      handleOpenChange(false);
    } catch {
      // Feilen vises i dialogen via serverFeil.
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Dialog.Editor
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <Button variant="destructive" size="sm" disabled={disabled || loading}>
          Sperr
        </Button>
      }
      backLabel="Til brukeren"
      eyebrow="Tilgang"
      title="Sperr bruker"
      description={`Sperr ${brukerEpost} fra booking og arrangementer.`}
      closeDisabled={loading}
    >
      <Form
        variant="editor"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSperr();
        }}
      >
        <Settings.Stack embedded>
          <Settings.Section
            embedded
            tone="danger"
            eyebrow="Sperring"
            title="Begrunn og avgrens sperringen"
            description="Uten utløpsdato gjelder sperringen til en administrator opphever den."
          >
            <Form.Fields>
              <Form.Field label="Årsak" description="Mellom 3 og 500 tegn." htmlFor="sperre-aarsak">
                <Input
                  id="sperre-aarsak"
                  aria-label="Årsak"
                  value={årsak}
                  onChange={(event) => setÅrsak(event.target.value)}
                  placeholder="Beskriv hvorfor brukeren sperres"
                  disabled={loading}
                />
              </Form.Field>

              <Form.Field label="Aktiv til" description="Valgfri utløpsdato.">
                <DatoVelger
                  value={aktivTil}
                  onChange={setAktivTil}
                  minDate={new Date()}
                  visNavigering={false}
                />
                {aktivTil ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAktivTil(null)}
                    disabled={loading}
                  >
                    Fjern utløpsdato
                  </Button>
                ) : null}
              </Form.Field>
            </Form.Fields>
          </Settings.Section>

          <Form.Actions>
            <ServerFeil feil={serverFeil} />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading || årsak.trim().length < 3}
            >
              {loading ? "Sperrer…" : "Sperr bruker"}
            </Button>
          </Form.Actions>
        </Settings.Stack>
      </Form>
    </Dialog.Editor>
  );
}
