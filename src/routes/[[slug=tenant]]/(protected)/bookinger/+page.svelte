<script lang="ts">
  import { resolve } from "$app/paths";
  const base = resolve("").replace(/\/$/, "");
  import { MyBookingsScreen } from "#lib/features/account/index.ts";
  import { buildTenantPath, getTenantContext } from "#lib/platform/tenant/index.ts";

  const tenant = getTenantContext();
  const bookingHref = buildTenantPath(tenant, "", base);
</script>

<MyBookingsScreen {bookingHref} />
