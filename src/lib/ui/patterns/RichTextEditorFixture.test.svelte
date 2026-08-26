<script lang="ts">
  import { Button, Form, FormField, FormFields, RichTextEditor } from "$lib/ui";

  let {
    disabled = false,
    value = $bindable(
      JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Velkommen" }] }],
      })
    ),
    invalid = false,
    onError,
    onValueChange,
    pending = false,
  }: {
    disabled?: boolean;
    invalid?: boolean;
    onError: (error: Error) => void;
    onValueChange: (value: string) => void;
    pending?: boolean;
    value?: string;
  } = $props();

  const externalValue = JSON.stringify({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2, textAlign: null },
        content: [{ type: "text", text: "Oppdatert presentasjon" }],
      },
    ],
  });
</script>

<Form aria-label="Arrangementpresentasjon">
  <FormFields>
    <FormField
      label="Presentasjon på nettsiden"
      description="Formater teksten som skal publiseres."
      error={invalid ? "Presentasjonen er ikke gyldig." : null}
      required
    >
      <RichTextEditor
        bind:value
        name="nettsideBeskrivelse"
        {disabled}
        {onError}
        {onValueChange}
        {pending}
      />
    </FormField>
  </FormFields>

  <Button type="button" variant="secondary" onclick={() => (value = externalValue)}>
    Last ekstern verdi
  </Button>
</Form>
