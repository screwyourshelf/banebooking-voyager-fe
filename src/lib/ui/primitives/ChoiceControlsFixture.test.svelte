<script lang="ts">
  import AccordionListPrimitive from "./AccordionListPrimitive.svelte";
  import AccordionRowPrimitive from "./AccordionRowPrimitive.svelte";
  import ChoiceButton from "./ChoiceButton.svelte";
  import Radio from "./Radio.svelte";
  import Switch from "./Switch.svelte";

  let choiceSelected = $state(true);
  let published = $state(false);
  let radioValue = $state("repeat");
  let expandedValue = $state("");
</script>

<form aria-label="Valgprimitives">
  <ChoiceButton selected={choiceSelected} onSelect={() => (choiceSelected = !choiceSelected)}>
    Bane 1
  </ChoiceButton>
  <ChoiceButton selected={false} disabled onSelect={() => undefined}>Låst valg</ChoiceButton>

  <Switch bind:checked={published} aria-label="Publisert" />
  <Switch checked disabled aria-label="Låst publisering" />

  <fieldset>
    <legend>Oppsettstype</legend>
    <label for="choice-repeat">
      <Radio
        id="choice-repeat"
        name="method"
        value="repeat"
        checked={radioValue === "repeat"}
        onSelect={(value) => (radioValue = value)}
      />
      Gjentakende
    </label>
    <label for="choice-manual">
      <Radio
        id="choice-manual"
        name="method"
        value="manual"
        checked={radioValue === "manual"}
        onSelect={(value) => (radioValue = value)}
      />
      Manuelt
    </label>
    <label for="choice-disabled">
      <Radio
        id="choice-disabled"
        name="method"
        value="disabled"
        checked={false}
        disabled
        onSelect={() => undefined}
      />
      Deaktivert
    </label>
  </fieldset>

  <AccordionListPrimitive bind:value={expandedValue}>
    <AccordionRowPrimitive value="first">
      Første rad
      {#snippet details()}<p>Første detalj.</p>{/snippet}
    </AccordionRowPrimitive>
    <AccordionRowPrimitive value="second">
      Andre rad
      {#snippet details()}<p>Andre detalj.</p>{/snippet}
    </AccordionRowPrimitive>
    <AccordionRowPrimitive value="disabled" disabled>
      Låst rad
      {#snippet details()}<p>Låst detalj.</p>{/snippet}
    </AccordionRowPrimitive>
  </AccordionListPrimitive>
</form>
