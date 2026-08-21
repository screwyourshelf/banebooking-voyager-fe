import { Form, Settings } from "@/components";

import { ServerFeil } from "@/components/errors";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GrenRespons } from "@/types";

type FormState = {
  navn: string;
  beskrivelse: string;
  grenId: string;
};

type Props = {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  grener: GrenRespons[];
  canSubmit: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  navnError: string | null;
  onBlurNavn: () => void;
  mutasjonFeil?: string | null;
};

export default function NyBaneContent({
  form,
  onChange,
  grener,
  canSubmit,
  isSaving,
  onSubmit,
  navnError,
  onBlurNavn,
  mutasjonFeil,
}: Props) {
  return (
    <Form
      variant="editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Settings.Stack embedded>
        <Settings.Section
          embedded
          eyebrow="Bane"
          title="Baneinformasjon"
          description="Det medlemmene skal kjenne igjen i bookingoversikten."
        >
          <Form.Fields>
            <Form.Field label="Navn" htmlFor="ny-navn" error={navnError}>
              <Input
                id="ny-navn"
                placeholder="For eksempel Bane A"
                disabled={isSaving}
                value={form.navn}
                onChange={(event) => onChange("navn", event.target.value)}
                onBlur={onBlurNavn}
                aria-invalid={!!navnError}
                autoComplete="off"
              />
            </Form.Field>

            <Form.Field label="Gren" htmlFor="ny-grenId">
              <Select
                disabled={isSaving}
                value={form.grenId}
                onValueChange={(value) => onChange("grenId", value)}
              >
                <SelectTrigger id="ny-grenId" aria-label="Gren">
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

            <Form.Field label="Beskrivelse" htmlFor="ny-beskrivelse">
              <Input
                id="ny-beskrivelse"
                placeholder="For eksempel nær klubbhuset"
                disabled={isSaving}
                value={form.beskrivelse}
                onChange={(event) => onChange("beskrivelse", event.target.value)}
                autoComplete="off"
              />
            </Form.Field>
          </Form.Fields>
        </Settings.Section>

        <Form.Actions>
          <ServerFeil feil={mutasjonFeil} />
          <Form.Submit isLoading={isSaving} disabled={!canSubmit} loadingText="Oppretter…">
            Opprett bane
          </Form.Submit>
        </Form.Actions>
      </Settings.Stack>
    </Form>
  );
}
