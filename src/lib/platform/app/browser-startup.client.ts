import { publicConfig } from "$lib/platform/config";
import { noopObservability, type Observability } from "$lib/platform/observability";
import {
  settLagringsfeilReporter,
  type Lagringsfeil,
} from "$lib/platform/storage/browser-storage.client";

const APP_STARTED_EVENT = "banebooking:app-started";
const ASSET_RECOVERY_ATTRIBUTE = "data-banebooking-asset-recovery";

let observability: Observability = noopObservability;
let initialization: Promise<void> | null = null;

export function initializeBrowserAppStartup() {
  initialization ??= initializeObservability();
  return initialization;
}

async function initializeObservability() {
  if (import.meta.env.PROD && publicConfig.sentryDsn) {
    try {
      const { createSentryBrowserObservability } =
        await import("$lib/platform/observability/sentry-browser.client");
      observability = createSentryBrowserObservability({
        dsn: publicConfig.sentryDsn,
        enabled: true,
        environment: import.meta.env.MODE,
      });
    } catch {
      // Observability skal degradere til no-op og må aldri blokkere appoppstarten.
    }
  }

  connectBrowserStorageErrorReporter(observability);
}

export function connectBrowserStorageErrorReporter(target: Observability) {
  settLagringsfeilReporter(createBrowserStorageErrorReporter(target));
}

export function createBrowserStorageErrorReporter(target: Observability) {
  return ({ lagringstype, operasjon, feil }: Lagringsfeil) => {
    target.captureMessage("Browser storage is unavailable", {
      errorName: feil instanceof Error ? feil.name : "UnknownError",
      operation: operasjon,
      storageType: lagringstype,
    });
  };
}

export function getBrowserObservability() {
  return observability;
}

export function isBrowserAssetRecoveryActive() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.hasAttribute(ASSET_RECOVERY_ATTRIBUTE)
  );
}

export function completeBrowserAppStartup() {
  globalThis.dispatchEvent(new Event(APP_STARTED_EVENT));
}
