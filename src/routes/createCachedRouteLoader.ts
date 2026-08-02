import type { ComponentType } from "react";

type RouteModule<T extends ComponentType> = {
  default: T;
};

export function createCachedRouteLoader<T extends ComponentType>(
  importer: () => Promise<RouteModule<T>>
) {
  let modulePromise: Promise<RouteModule<T>> | undefined;

  return () => {
    modulePromise ??= importer().catch((error: unknown) => {
      modulePromise = undefined;
      throw error;
    });

    return modulePromise;
  };
}
