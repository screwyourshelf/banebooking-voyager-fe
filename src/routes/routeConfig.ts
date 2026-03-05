import { lazy, type ComponentType } from "react";

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

const loadBookingPage = () => import("@/features/booking/pages/BookingPage");
const loadMinSidePage = () => import("@/features/minside/pages/MinSidePage");
const loadMineBookingerPage = () => import("@/features/minside/pages/MineBookingerPage");
const loadArrangementerPage = () => import("@/features/arrangementer/pages/ArrangementerPage");
const loadArrangementAdminPage = () => import("@/features/arrangement-admin/pages/ArrangementPage");

const loadKlubbPage = () => import("@/features/klubb/pages/KlubbPage");
const loadBanerPage = () => import("@/features/baner/pages/BanerPage");
const loadBrukerePage = () => import("@/features/brukere/pages/BrukerePage");

const loadVilkaarPage = () => import("@/features/policy/pages/VilkaarPage");

/*
  Lazy components
*/

const BookingPage = lazy(loadBookingPage);
const MinSidePage = lazy(loadMinSidePage);
const MineBookingerPage = lazy(loadMineBookingerPage);
const ArrangementerPage = lazy(loadArrangementerPage);
const ArrangementAdminPage = lazy(loadArrangementAdminPage);

const KlubbPage = lazy(loadKlubbPage);
const BanerPage = lazy(loadBanerPage);
const BrukerePage = lazy(loadBrukerePage);

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
    path: "minside",
    breadcrumb: "Min side",
    protected: true,
    component: MinSidePage,
    loader: loadMinSidePage,
  },

  {
    path: "bookinger",
    breadcrumb: "Mine bookinger",
    protected: true,
    component: MineBookingerPage,
    loader: loadMineBookingerPage,
  },

  {
    path: "arrangementer",
    breadcrumb: "Arrangementer",
    protected: true,
    component: ArrangementerPage,
    loader: loadArrangementerPage,
  },

  {
    path: "arrangement",
    breadcrumb: "Arrangement",
    protected: true,
    component: ArrangementAdminPage,
    loader: loadArrangementAdminPage,
  },

  {
    path: "admin",
    breadcrumb: "Admin",
    children: [
      {
        path: "klubb",
        breadcrumb: "Klubb",
        protected: true,
        component: KlubbPage,
        loader: loadKlubbPage,
      },
      {
        path: "baner",
        breadcrumb: "Baner",
        protected: true,
        component: BanerPage,
        loader: loadBanerPage,
      },
      {
        path: "brukere",
        breadcrumb: "Brukere",
        protected: true,
        component: BrukerePage,
        loader: loadBrukerePage,
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
  const lower = segment.toLowerCase();

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

  return search(routeConfig) ?? capitalize(segment);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
