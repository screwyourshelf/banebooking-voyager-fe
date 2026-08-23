export type ObservabilityContext = Readonly<Record<string, boolean | number | string | null>>;

export type Observability = {
  captureException(error: unknown, context?: ObservabilityContext): void;
  captureMessage(message: string, context?: ObservabilityContext): void;
};

type ObservabilityReporter = Observability;

const SENSITIVE_KEY_PATTERN = /authorization|cookie|credential|password|secret|session|token/i;

export function createObservabilityAdapter(reporter: ObservabilityReporter): Observability {
  return {
    captureException(error, context) {
      reporter.captureException(error, sanitizeObservabilityContext(context));
    },
    captureMessage(message, context) {
      reporter.captureMessage(message, sanitizeObservabilityContext(context));
    },
  };
}

export const noopObservability: Observability = {
  captureException() {},
  captureMessage() {},
};

function sanitizeObservabilityContext(
  context: ObservabilityContext | undefined
): ObservabilityContext | undefined {
  if (!context) return undefined;

  return Object.fromEntries(
    Object.entries(context)
      .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 250) : value])
  );
}
