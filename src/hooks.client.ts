import type { ClientInit, HandleClientError } from "@sveltejs/kit";

import {
  getBrowserObservability,
  initializeBrowserAppStartup,
  isBrowserAssetRecoveryActive,
} from "$lib/platform/app/browser-startup.client";

export const init: ClientInit = () => initializeBrowserAppStartup();

export const handleError: HandleClientError = ({ error, event, status }) => {
  if (isBrowserAssetRecoveryActive()) return;

  getBrowserObservability().captureException(error, {
    routeId: event.route.id,
    source: "sveltekit.client",
    status,
  });
};
