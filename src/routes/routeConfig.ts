import { lazy, type ComponentType } from "react";

import { createCachedRouteLoader } from "./createCachedRouteLoader";

export interface RouteConfig {
  path: string;
  breadcrumb: string;
  index?: boolean;
  protected?: boolean;
  component?: ComponentType;
  loader?: () => Promise<unknown>;
  children?: RouteConfig[];
}

/*
  Page loaders (brukes til både lazy og prefetch)
*/

const loadBookingPage = createCachedRouteLoader(
  () => import("@/features/booking/pages/BookingPage")
);
const loadLoginPage = createCachedRouteLoader(() => import("@/features/auth/pages/LoginPage"));
const loadMinSidePage = createCachedRouteLoader(
  () => import("@/features/minside/pages/MinSidePage")
);
const loadMineBookingerPage = createCachedRouteLoader(
  () => import("@/features/minside/pages/MineBookingerPage")
);
const loadArrangementerPage = createCachedRouteLoader(
  () => import("@/features/arrangementer/pages/ArrangementerPage")
);
const loadNyheterPage = createCachedRouteLoader(() => import("@/features/feed/pages/NyheterPage"));
const loadArrangementAdminPage = createCachedRouteLoader(
  () => import("@/features/arrangement-admin/pages/ArrangementPage")
);
const loadTurneringPage = createCachedRouteLoader(
  () => import("@/features/turnering/pages/TurneringPage")
);

const loadKlubbPage = createCachedRouteLoader(() => import("@/features/klubb/pages/KlubbPage"));
const loadBanerPage = createCachedRouteLoader(() => import("@/features/baner/pages/BanerPage"));
const loadBrukerePage = createCachedRouteLoader(
  () => import("@/features/brukere/pages/BrukerePage")
);
const loadGrenerPage = createCachedRouteLoader(() => import("@/features/grener/pages/GrenerPage"));
const loadKunngjøringerAdminPage = createCachedRouteLoader(
  () => import("@/features/kunngjøringer/pages/KunngjøringerAdminPage")
);

const loadVilkaarPage = createCachedRouteLoader(
  () => import("@/features/policy/pages/VilkaarPage")
);

/*
  Lazy components
*/

const BookingPage = lazy(loadBookingPage);
const LoginPage = lazy(loadLoginPage);
const MinSidePage = lazy(loadMinSidePage);
const MineBookingerPage = lazy(loadMineBookingerPage);
const ArrangementerPage = lazy(loadArrangementerPage);
const NyheterPage = lazy(loadNyheterPage);
const ArrangementAdminPage = lazy(loadArrangementAdminPage);
const TurneringPage = lazy(loadTurneringPage);

const KlubbPage = lazy(loadKlubbPage);
const BanerPage = lazy(loadBanerPage);
const BrukerePage = lazy(loadBrukerePage);
const GrenerPage = lazy(loadGrenerPage);
const KunngjøringerAdminPage = lazy(loadKunngjøringerAdminPage);

const VilkaarPage = lazy(loadVilkaarPage);

/*
  Route configuration
*/

export const routeConfig: RouteConfig[] = [
  {
    path: "",
    breadcrumb: "Book bane",
    index: true,
    component: BookingPage,
    loader: loadBookingPage,
  },

  {
    path: "vilkaar",
    breadcrumb: "Vilkår",
    component: VilkaarPage,
    loader: loadVilkaarPage,
  },

  {
    path: "login",
    breadcrumb: "Logg inn",
    component: LoginPage,
    loader: loadLoginPage,
  },

  {
    path: "minside",
    breadcrumb: "Min side",
    protected: true,
    component: MinSidePage,
    loader: loadMinSidePage,
  },

  {
    path: "bookinger",
    breadcrumb: "Mine tider",
    protected: true,
    component: MineBookingerPage,
    loader: loadMineBookingerPage,
  },

  {
    path: "arrangementer",
    breadcrumb: "Arrangementer",
    component: ArrangementerPage,
    loader: loadArrangementerPage,
  },

  {
    path: "nyheter",
    breadcrumb: "Nyheter",
    component: NyheterPage,
    loader: loadNyheterPage,
  },

  {
    path: "arrangement",
    breadcrumb: "Administrer arrangementer",
    protected: true,
    component: ArrangementAdminPage,
    loader: loadArrangementAdminPage,
  },

  {
    path: "turnering/:turneringId",
    breadcrumb: "Turnering",
    protected: true,
    component: TurneringPage,
    loader: loadTurneringPage,
  },

  {
    path: "admin",
    breadcrumb: "Administrasjon",
    children: [
      {
        path: "klubb",
        breadcrumb: "Klubbinnstillinger",
        protected: true,
        component: KlubbPage,
        loader: loadKlubbPage,
      },
      {
        path: "baner",
        breadcrumb: "Baner og grener",
        protected: true,
        component: BanerPage,
        loader: loadBanerPage,
      },
      {
        path: "grener",
        breadcrumb: "Baner og grener",
        protected: true,
        component: GrenerPage,
        loader: loadGrenerPage,
      },
      {
        path: "brukere",
        breadcrumb: "Brukere",
        protected: true,
        component: BrukerePage,
        loader: loadBrukerePage,
      },
      {
        path: "kunngjøringer",
        breadcrumb: "Kunngjøringer",
        protected: true,
        component: KunngjøringerAdminPage,
        loader: loadKunngjøringerAdminPage,
      },
    ],
  },
];

/*
  Flater ut nestede ruter til en liste med full path
*/

export function flattenRoutes(
  routes: RouteConfig[],
  parentPath = ""
): Array<RouteConfig & { fullPath: string }> {
  return routes.flatMap((route) => {
    const fullPath = route.index
      ? parentPath
      : parentPath
        ? `${parentPath}/${route.path}`
        : route.path;

    const flat = { ...route, fullPath };

    if (!route.children) return [flat];

    return [flat, ...flattenRoutes(route.children, fullPath)];
  });
}

/*
  Breadcrumb lookup
*/

export function getBreadcrumbName(segment: string): string {
  const decoded = decodeURIComponent(segment);
  const lower = decoded.toLowerCase();

  function search(routes: RouteConfig[]): string | undefined {
    for (const route of routes) {
      if (route.path.toLowerCase() === lower) {
        return route.breadcrumb;
      }

      if (route.children) {
        const found = search(route.children);
        if (found) return found;
      }
    }
  }

  return search(routeConfig) ?? capitalize(decoded);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
