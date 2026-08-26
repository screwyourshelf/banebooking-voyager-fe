<script lang="ts">
  import Button from "../primitives/Button.svelte";
  import Input from "../primitives/Input.svelte";
  import Textarea from "../primitives/Textarea.svelte";
  import Form from "./Form.svelte";
  import FormActions from "./FormActions.svelte";
  import FormField from "./FormField.svelte";
  import FormFields from "./FormFields.svelte";
  import FormSubmit from "./FormSubmit.svelte";

  type Values = { message: string; title: string };

  let {
    disabled = false,
    invalid = false,
    onCancel,
    onSubmit,
    pending = false,
  }: {
    disabled?: boolean;
    invalid?: boolean;
    onCancel: () => void;
    onSubmit: (values: Values) => void;
    pending?: boolean;
  } = $props();

  let message = $state("");
  let title = $state("");

  function submit(event: SubmitEvent) {
    event.preventDefault();
    onSubmit({ message, title });
  }
</script>

<Form variant="editor" {pending} onsubmit={submit}>
  <FormFields>
    <FormField
      label="Tittel"
      description="Kort overskrift for kunngjøringen."
      error={invalid ? "Tittel må fylles ut." : undefined}
      required
    >
      <Input bind:value={title} placeholder="Viktig informasjon" {disabled} />
    </FormField>

    <FormField label="Budskap" description="Innholdet brukerne må bekrefte.">
      <Textarea bind:value={message} rows={4} {disabled} />
    </FormField>
  </FormFields>

  <FormActions align="between">
    <Button variant="secondary" onclick={onCancel}>Avbryt</Button>
    <FormSubmit {pending} pendingLabel="Publiserer …">Publiser</FormSubmit>
  </FormActions>
</Form>
