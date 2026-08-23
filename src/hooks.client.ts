import type { ClientInit, HandleClientError } from "@sveltejs/kit";

import {
  getBrowserObservability,
  initializeBrowserAppStartup,
} from "$lib/platform/app/browser-startup.client";

export const init: ClientInit = () => initializeBrowserAppStartup();

export const handleError: HandleClientError = ({ error, event, status }) => {
  getBrowserObservability().captureException(error, {
    routeId: event.route.id,
    source: "sveltekit.client",
    status,
  });
};
