<script>
  import { Button as Action } from "#lib/ui/index.js";
  const override = { style: "color: red" };
</script>

<Action class="bg-surface" style="color: red">Lagre</Action>
<Action {...override}>Lagre</Action>
