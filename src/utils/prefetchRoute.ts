import { routeConfig, flattenRoutes } from "@/routes/routeConfig";
import { config } from "@/config";

const routes = flattenRoutes(routeConfig);

function normalizeRoutePath(path: string) {
  return path.replace(/^\.\/?/, "").replace(/^\/+|\/+$/g, "");
}

function matchesRoute(routePath: string, requestedPath: string) {
  const routeSegments = normalizeRoutePath(routePath).split("/").filter(Boolean);
  const requestedSegments = normalizeRoutePath(requestedPath).split("/").filter(Boolean);

  return (
    routeSegments.length === requestedSegments.length &&
    routeSegments.every(
      (segment, index) => segment.startsWith(":") || segment === requestedSegments[index]
    )
  );
}

export function prefetchRoute(path: string) {
  const requestedPath = normalizeRoutePath(path);
  const route = routes.find((candidate) => matchesRoute(candidate.fullPath, requestedPath));

  if (route?.loader) {
    void route.loader().catch(() => undefined);
  }
}

export function routePrefetchProps(path: string) {
  return {
    onFocus: () => prefetchRoute(path),
    onMouseEnter: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  };
}

export function prefetchCurrentRoute(pathname = window.location.pathname) {
  const basePath = normalizeRoutePath(import.meta.env.BASE_URL);
  let routePath = normalizeRoutePath(pathname);

  if (basePath && (routePath === basePath || routePath.startsWith(`${basePath}/`))) {
    routePath = normalizeRoutePath(routePath.slice(basePath.length));
  }

  if (!config.tenantSlug) {
    const [, ...routeSegments] = routePath.split("/").filter(Boolean);
    routePath = routeSegments.join("/");
  }

  prefetchRoute(routePath);
}
