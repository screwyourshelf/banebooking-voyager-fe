import type { ClientInit, HandleClientError } from "@sveltejs/kit/hooks";

import {
  getBrowserObservability,
  initializeBrowserAppStartup,
  isBrowserAssetRecoveryActive,
} from "#lib/platform/app/browser-startup.client.ts";

export const init: ClientInit = () => initializeBrowserAppStartup();

export const handleError: HandleClientError = ({ error, event, kind }) => {
  if (kind !== "unknown" || isBrowserAssetRecoveryActive()) return;

  getBrowserObservability().captureException(error, {
    routeId: event.route.id,
    source: "sveltekit.client",
    status: 500,
  });
};
