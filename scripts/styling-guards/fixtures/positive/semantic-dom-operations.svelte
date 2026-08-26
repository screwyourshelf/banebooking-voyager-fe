<script lang="ts">
  let element: HTMLButtonElement;

  function synchronizeSemantics() {
    element.focus();
    element.setAttribute("aria-busy", "true");
    element.removeAttribute("hidden");
  }
</script>

<button bind:this={element} onclick={synchronizeSemantics}>Fortsett</button>
