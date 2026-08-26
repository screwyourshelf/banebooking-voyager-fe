<script lang="ts">
  import Tabs from "./Tabs.svelte";

  let value = $state("profile");
</script>

{#snippet profile()}<p>Klubbprofilinnhold</p>{/snippet}
{#snippet membership()}<p>Medlemskapsinnhold</p>{/snippet}

<Tabs
  label="Innstillingsområder"
  bind:value
  items={[
    { value: "profile", label: "Klubbprofil", content: profile },
    { value: "membership", label: "Medlemskap", content: membership },
  ]}
/>
