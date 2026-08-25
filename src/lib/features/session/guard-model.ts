import type { BrukerRespons } from "$lib/contracts";
import { harHandling } from "$lib/domain";
import type { AppPath, TenantContext } from "$lib/platform/tenant";
import { buildTenantPath, normalizeAppPathname, readSafeReturnPath } from "$lib/platform/tenant";

export type GuardRedirectInput = {
  bruker: BrukerRespons;
  currentUrl: Pick<URL, "pathname" | "searchParams">;
  tenant: TenantContext;
  basePath?: string;
};

export function resolvePolicyRedirect({
  bruker,
  currentUrl,
  tenant,
  basePath = "",
}: GuardRedirectInput): AppPath | null {
  const currentLeaf =
    normalizeAppPathname(currentUrl.pathname).split("/").filter(Boolean).at(-1) ?? "";
  const root = buildTenantPath(tenant, "", basePath);

  if (bruker.erSperret) {
    return currentLeaf === "sperret" ? null : buildTenantPath(tenant, "sperret", basePath);
  }

  if (bruker.ulestKunngjøring) {
    return currentLeaf === "kunngjøring" ? null : buildTenantPath(tenant, "kunngjøring", basePath);
  }

  if (bruker.måBekrefteMedlemskap) {
    return currentLeaf === "bekreft-medlemskap" || currentLeaf === "vilkaar"
      ? null
      : buildTenantPath(tenant, "bekreft-medlemskap", basePath);
  }

  if (["sperret", "kunngjøring", "bekreft-medlemskap"].includes(currentLeaf)) return root;

  if (currentLeaf === "login") {
    return readSafeReturnPath(currentUrl.searchParams.get("returnTo"), tenant, basePath) ?? root;
  }

  return null;
}

export function requiredCapabilitiesForPath(pathname: string): readonly string[] | null {
  const normalizedPathname = normalizeAppPathname(pathname);
  const rules: Array<[RegExp, readonly string[]]> = [
    [/\/arrangement\/?$/, ["arrangement:se"]],
    [/\/admin\/klubb\/?$/, ["klubb:admin"]],
    [/\/admin\/baner\/?$/, ["baner:admin"]],
    [/\/admin\/grener\/?$/, ["grener:admin"]],
    [/\/admin\/brukere\/?$/, ["brukere:lese", "brukere:admin"]],
    [/\/admin\/kunngjøringer\/?$/, ["kunngjøring:admin"]],
    [/\/admin\/statistikk\/?$/, ["statistikk:lese"]],
  ];

  return rules.find(([pattern]) => pattern.test(normalizedPathname))?.[1] ?? null;
}

export function hasAnyRequiredCapability(
  bruker: Pick<BrukerRespons, "kapabiliteter"> | null | undefined,
  requiredCapabilities: readonly string[]
) {
  return (
    requiredCapabilities.length === 0 ||
    requiredCapabilities.some((capability) => harHandling(bruker?.kapabiliteter, capability))
  );
}
