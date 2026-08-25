import type { BrukerRespons, KlubbRespons } from "$lib/contracts";
import { formaterRoller } from "$lib/domain";
import type { AuthState } from "$lib/platform/auth";
import {
  buildTenantPath,
  normalizeAppPathname,
  type AppPath,
  type TenantContext,
} from "$lib/platform/tenant";
import { hasAnyRequiredCapability, requiredCapabilitiesForPath } from "./guard-model";
import type { SessionQueryStatus } from "./context";

export type AppNavigationIcon =
  | "account"
  | "announcements"
  | "booking"
  | "calendar"
  | "courts"
  | "events-admin"
  | "more"
  | "my-bookings"
  | "news"
  | "settings"
  | "statistics"
  | "users";

export type AppNavigationItem = {
  active: boolean;
  href: AppPath;
  icon: AppNavigationIcon;
  id: string;
  label: string;
  mobileLabel?: string;
};

type AppNavigationSection = {
  id: "admin" | "overview" | "personal";
  items: AppNavigationItem[];
  label: string;
};

export type ReadyAppNavigationState = {
  account: {
    authenticated: boolean;
    email: string | null;
    label: string;
    roleLabel: string;
  };
  desktopSections: AppNavigationSection[];
  identity: {
    href: AppPath;
    logoSources: readonly [tenantSvg: string, tenantWebp: string, defaultSvg: string];
    meta: string;
    name: string;
  };
  loginHref: AppPath;
  mobilePrimary: AppNavigationItem[];
  mobileSecondary: AppNavigationSection[];
  newsHref: AppPath;
  status: "ready";
};

export type AppNavigationState = { label: string; status: "loading" } | ReadyAppNavigationState;

type QueryState<T> = {
  data: T;
  status: SessionQueryStatus;
};

type BuildAppNavigationStateInput = {
  auth: AuthState;
  basePath?: string;
  bruker: QueryState<BrukerRespons | null | undefined>;
  klubb: QueryState<KlubbRespons | undefined>;
  pathname: string;
  tenant: TenantContext;
};

type NavigationDestination = {
  activeRelativePaths?: readonly string[];
  capabilityRoutePaths?: readonly string[];
  icon: AppNavigationIcon;
  id: string;
  label: string;
  mobileLabel?: string;
  mobilePrimaryOrder?: number;
  relativePath: string;
  requiresAuth?: boolean;
  section: AppNavigationSection["id"];
};

// Dette er synlig navigasjonsinnhold, ikke en router eller guardtabell. SvelteKit-filene eier
// fortsatt routes, og adminsynlighet henter kapabilitetskrav fra guard-modellen nedenfor.
const destinations: readonly NavigationDestination[] = [
  {
    id: "booking",
    relativePath: "",
    label: "Book bane",
    mobileLabel: "Book",
    icon: "booking",
    section: "overview",
    mobilePrimaryOrder: 1,
  },
  {
    id: "arrangementer",
    relativePath: "arrangementer",
    label: "Arrangementer",
    icon: "calendar",
    section: "overview",
    mobilePrimaryOrder: 3,
  },
  {
    id: "nyheter",
    relativePath: "nyheter",
    label: "Nyheter",
    icon: "news",
    section: "overview",
  },
  {
    id: "bookinger",
    relativePath: "bookinger",
    label: "Mine tider",
    icon: "my-bookings",
    section: "personal",
    requiresAuth: true,
    mobilePrimaryOrder: 2,
  },
  {
    id: "minside",
    relativePath: "minside",
    label: "Min side",
    icon: "account",
    section: "personal",
    requiresAuth: true,
  },
  {
    id: "brukere",
    relativePath: "admin/brukere",
    label: "Brukere",
    icon: "users",
    section: "admin",
    capabilityRoutePaths: ["admin/brukere"],
  },
  {
    id: "baner-og-grener",
    relativePath: "admin/baner",
    activeRelativePaths: ["admin/baner", "admin/grener"],
    label: "Baner og grener",
    icon: "courts",
    section: "admin",
    capabilityRoutePaths: ["admin/baner", "admin/grener"],
  },
  {
    id: "kunngjoringer",
    relativePath: "admin/kunngjøringer",
    label: "Kunngjøringer",
    icon: "announcements",
    section: "admin",
    capabilityRoutePaths: ["admin/kunngjøringer"],
  },
  {
    id: "statistikk",
    relativePath: "admin/statistikk",
    label: "Statistikk",
    icon: "statistics",
    section: "admin",
    capabilityRoutePaths: ["admin/statistikk"],
  },
  {
    id: "arrangement-admin",
    relativePath: "arrangement",
    label: "Administrer arrangementer",
    icon: "events-admin",
    section: "admin",
    capabilityRoutePaths: ["arrangement"],
  },
  {
    id: "klubbinnstillinger",
    relativePath: "admin/klubb",
    label: "Klubbinnstillinger",
    icon: "settings",
    section: "admin",
    capabilityRoutePaths: ["admin/klubb"],
  },
];

const sectionLabels: Record<AppNavigationSection["id"], string> = {
  overview: "Hovedmeny",
  personal: "Min konto",
  admin: "Administrasjon",
};

export function buildAppNavigationState({
  auth,
  basePath = "",
  bruker,
  klubb,
  pathname,
  tenant,
}: BuildAppNavigationStateInput): AppNavigationState {
  if (
    auth.status === "initializing" ||
    klubb.status === "pending" ||
    (auth.status === "authenticated" && klubb.status === "success" && bruker.status === "pending")
  ) {
    return { status: "loading", label: "Laster navigasjon …" };
  }

  const authenticated = auth.status === "authenticated";
  const visibleDestinations = destinations.filter((destination) => {
    if (destination.requiresAuth && !authenticated) return false;
    if (!destination.capabilityRoutePaths) return true;

    const requiredCapabilities = destination.capabilityRoutePaths.flatMap(
      (routePath) => requiredCapabilitiesForPath(`/${routePath}`) ?? []
    );
    return hasAnyRequiredCapability(bruker.data, requiredCapabilities);
  });

  const items = visibleDestinations.map((destination) =>
    buildNavigationItem(destination, pathname, tenant, basePath)
  );
  const desktopSections = buildSections(items);
  const primaryIds = new Set(
    visibleDestinations
      .filter((destination) => destination.mobilePrimaryOrder !== undefined)
      .sort((a, b) => (a.mobilePrimaryOrder ?? 0) - (b.mobilePrimaryOrder ?? 0))
      .map((destination) => destination.id)
  );
  const mobilePrimary = [...primaryIds].map((id) => items.find((item) => item.id === id)!);
  const secondaryItems = items.filter((item) => item.id !== "nyheter" && !primaryIds.has(item.id));
  const accountUser = auth.status === "authenticated" ? auth.user : null;

  return {
    status: "ready",
    identity: {
      href: buildTenantPath(tenant, "", basePath),
      logoSources: buildTenantLogoSources(tenant, basePath),
      name: klubb.data?.navn || "Banebooking",
      meta: "Banebooking",
    },
    account: {
      authenticated,
      email: accountUser?.email ?? null,
      label: accountUser?.name || accountUser?.email || (authenticated ? "Din konto" : "Logg inn"),
      roleLabel: authenticated
        ? formaterRoller(bruker.data?.roller, "Innlogget")
        : "Ikke innlogget",
    },
    desktopSections,
    mobilePrimary,
    mobileSecondary: buildSections(secondaryItems),
    loginHref: buildTenantPath(tenant, "login", basePath),
    newsHref: buildTenantPath(tenant, "nyheter", basePath),
  };
}

function buildTenantLogoSources(
  tenant: TenantContext,
  basePath: string
): ReadyAppNavigationState["identity"]["logoSources"] {
  const normalizedBasePath = basePath.replace(/\/+$/, "");
  const assetRoot = `${normalizedBasePath}/klubber`;
  const tenantAssetRoot = `${assetRoot}/${encodeURIComponent(tenant.slug)}/img`;

  return [
    `${tenantAssetRoot}/logo.svg`,
    `${tenantAssetRoot}/logo.webp`,
    `${assetRoot}/default/img/logo.svg`,
  ];
}

function buildNavigationItem(
  destination: NavigationDestination,
  pathname: string,
  tenant: TenantContext,
  basePath: string
): AppNavigationItem {
  const activePaths = destination.activeRelativePaths ?? [destination.relativePath];

  return {
    id: destination.id,
    href: buildTenantPath(tenant, destination.relativePath, basePath),
    label: destination.label,
    mobileLabel: destination.mobileLabel,
    icon: destination.icon,
    active: activePaths.some((path) =>
      pathsEqual(pathname, buildTenantPath(tenant, path, basePath))
    ),
  };
}

function buildSections(items: AppNavigationItem[]): AppNavigationSection[] {
  return (["overview", "personal", "admin"] as const)
    .map((id) => ({
      id,
      label: sectionLabels[id],
      items: items.filter(
        (item) => destinations.find((entry) => entry.id === item.id)?.section === id
      ),
    }))
    .filter((section) => section.items.length > 0);
}

function pathsEqual(actual: string, expected: string) {
  return normalizeAppPathname(actual) === normalizeAppPathname(expected);
}
