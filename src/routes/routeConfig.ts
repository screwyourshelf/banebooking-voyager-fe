import { lazy, type ComponentType } from "react";

export interface RouteConfig {
  path: string;
  breadcrumb: string;
  index?: boolean;
  protected?: boolean;
  component?: ComponentType;
  children?: RouteConfig[];
}

// Lazy-loadede komponenter
const BookingPage = lazy(() => import("@/features/booking/pages/BookingPage"));
const MinSidePage = lazy(() => import("@/features/minside/pages/MinSidePage"));
const KlubbPage = lazy(() => import("@/features/klubb/pages/KlubbPage"));
const BanerPage = lazy(() => import("@/features/baner/pages/BanerPage"));
const ArrangementPage = lazy(() => import("@/features/arrangement/pages/ArrangementPage"));
const BrukerePage = lazy(() => import("@/features/brukere/pages/BrukerePage"));
const VilkaarPage = lazy(() => import("@/features/policy/pages/VilkaarPage"));

export const routeConfig: RouteConfig[] = [
  { path: "", breadcrumb: "Book bane", index: true, component: BookingPage },
  { path: "vilkaar", breadcrumb: "Vilkår", component: VilkaarPage },
  { path: "minside", breadcrumb: "Min side", protected: true, component: MinSidePage },
  { path: "arrangement", breadcrumb: "Arrangement", protected: true, component: ArrangementPage },
  {
    path: "admin",
    breadcrumb: "Admin",
    children: [
      { path: "klubb", breadcrumb: "Klubb", protected: true, component: KlubbPage },
      { path: "baner", breadcrumb: "Baner", protected: true, component: BanerPage },
      { path: "brukere", breadcrumb: "Brukere", protected: true, component: BrukerePage },
    ],
  },
];

/**
 * Flater ut nestede ruter til en liste med fulle paths.
 * Brukes for å generere React Router-ruter.
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

    const flatRoute = { ...route, fullPath };

    if (route.children) {
      return [flatRoute, ...flattenRoutes(route.children, route.path)];
    }
    return [flatRoute];
  });
}

/**
 * Slår opp breadcrumb-navn for et URL-segment.
 * Søker rekursivt gjennom routeConfig.
 */
export function getBreadcrumbName(segment: string): string {
  const lower = segment.toLowerCase();

  function search(routes: RouteConfig[]): string | null {
    for (const route of routes) {
      if (route.path.toLowerCase() === lower) {
        return route.breadcrumb;
      }
      if (route.children) {
        const found = search(route.children);
        if (found) return found;
      }
    }
    return null;
  }

  const found = search(routeConfig);
  return found ?? capitalize(segment);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
