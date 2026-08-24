<script lang="ts">
  import Form from "./Form.svelte";
  import FormSteps from "./FormSteps.svelte";

  let { onValueChange }: { onValueChange: (value: string) => void } = $props();
</script>

<FormSteps
  label="Oppsettsteg"
  items={[
    { value: "details", label: "Detaljer" },
    { value: "schedule", label: "Tidspunkt" },
  ]}
  {onValueChange}
>
  <Form><p>Steginnhold</p></Form>
</FormSteps>
