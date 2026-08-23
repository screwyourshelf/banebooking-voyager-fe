<script lang="ts">
  import { base } from "$app/paths";
  import { MyBookingsScreen } from "$lib/features/account";
  import { buildTenantPath, getTenantContext } from "$lib/platform/tenant";

  const tenant = getTenantContext();
  const bookingHref = buildTenantPath(tenant, "", base);
</script>

<MyBookingsScreen {bookingHref} />
