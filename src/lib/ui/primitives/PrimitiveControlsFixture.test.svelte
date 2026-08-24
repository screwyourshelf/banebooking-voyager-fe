<script lang="ts">
  import Button from "./Button.svelte";
  import ButtonLink from "./ButtonLink.svelte";
  import Icon, { type IconData } from "./Icon.svelte";
  import Input from "./Input.svelte";
  import Textarea from "./Textarea.svelte";

  const fixtureIcon: IconData = [["path", { d: "M5 12h14", key: "line" }]];

  let message = $state("Åpner mandag");
  let title = $state("Ny sesong");
</script>

<div>
  <Button>Primær</Button>
  <Button variant="secondary" size="small">Sekundær</Button>
  <Button variant="destructive" disabled>Destruktiv</Button>
  <Button variant="ghost" fullWidth>Diskré</Button>
  <Button aria-label="Ikonhandling" variant="ghost" size="icon">
    <Icon icon={fixtureIcon} size="button" />
  </Button>
  <Button aria-label="Kompakt ikonhandling" variant="ghost" size="compact-icon">×</Button>
  <ButtonLink href="/neste" variant="primary">Fortsett</ButtonLink>

  <form aria-label="Primitive skjemakontroller">
    <label for="primitive-title">Tittel</label>
    <Input id="primitive-title" name="title" bind:value={title} placeholder="Tittel" />
    <label for="primitive-message">Budskap</label>
    <Textarea id="primitive-message" name="message" bind:value={message} placeholder="Budskap" />
  </form>
</div>
