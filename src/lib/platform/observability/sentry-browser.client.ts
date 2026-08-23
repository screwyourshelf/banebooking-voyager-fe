import * as Sentry from "@sentry/browser";

import {
  createObservabilityAdapter,
  noopObservability,
  type Observability,
  type ObservabilityContext,
} from "./index";

type SentryEvent = Record<string, unknown>;

type SentryScope = {
  setContext(name: string, context: ObservabilityContext): void;
};

type SentryBrowserSdk = {
  captureException(error: unknown): void;
  captureMessage(message: string): void;
  init(options: Parameters<typeof Sentry.init>[0]): void;
  withScope(callback: (scope: SentryScope) => void): void;
};

export type SentryBrowserOptions = {
  dsn: string;
  enabled: boolean;
  environment: string;
};

const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|credential|password|secret|session|token|request.?body|response/i;
const URL_VALUE_KEY_PATTERN = /^(?:from|to|url)$/i;

const sentryBrowserSdk: SentryBrowserSdk = {
  captureException: Sentry.captureException,
  captureMessage: Sentry.captureMessage,
  init: Sentry.init,
  withScope: Sentry.withScope,
};

export function createSentryBrowserObservability(
  options: SentryBrowserOptions,
  sdk: SentryBrowserSdk = sentryBrowserSdk
): Observability {
  const dsn = options.dsn.trim();
  if (!options.enabled || !dsn) return noopObservability;

  sdk.init({
    dsn,
    environment: options.environment,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    beforeBreadcrumb(breadcrumb) {
      return sanitizeSentryValue(breadcrumb) as typeof breadcrumb;
    },
    beforeSend(event) {
      return sanitizeSentryEvent(event as unknown as SentryEvent) as unknown as typeof event;
    },
  });

  return createObservabilityAdapter({
    captureException(error, context) {
      captureWithContext(sdk, context, () => sdk.captureException(error));
    },
    captureMessage(message, context) {
      captureWithContext(sdk, context, () => sdk.captureMessage(message));
    },
  });
}

export function sanitizeSentryEvent(event: SentryEvent): SentryEvent {
  const sanitized = sanitizeSentryValue(event) as SentryEvent;
  delete sanitized.user;

  const request = sanitized.request;
  if (isRecord(request)) {
    delete request.cookies;
    delete request.data;
    delete request.env;
    delete request.headers;
    delete request.query_string;
    if (typeof request.url === "string") request.url = stripUrlQueryAndHash(request.url);
  }

  return sanitized;
}

function captureWithContext(
  sdk: SentryBrowserSdk,
  context: ObservabilityContext | undefined,
  capture: () => void
) {
  if (!context || Object.keys(context).length === 0) {
    capture();
    return;
  }

  sdk.withScope((scope) => {
    scope.setContext("banebooking", context);
    capture();
  });
}

function sanitizeSentryValue(value: unknown): unknown {
  if (typeof value === "string") return value.slice(0, 250);
  if (Array.isArray(value)) return value.map(sanitizeSentryValue);
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
      .map(([key, nestedValue]) => [
        key,
        URL_VALUE_KEY_PATTERN.test(key) && typeof nestedValue === "string"
          ? stripUrlQueryAndHash(nestedValue)
          : sanitizeSentryValue(nestedValue),
      ])
  );
}

function stripUrlQueryAndHash(value: string) {
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) return value.split(/[?#]/, 1)[0];

  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
