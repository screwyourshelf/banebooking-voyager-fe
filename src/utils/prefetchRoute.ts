import { routeConfig, flattenRoutes } from "@/routes/routeConfig";

const routes = flattenRoutes(routeConfig);

export function prefetchRoute(path: string) {
  const route = routes.find((r) => r.fullPath === path);
  route?.loader?.();
}
