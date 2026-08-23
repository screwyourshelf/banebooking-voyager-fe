import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";

const appHtml = readFileSync(new URL("../../../app.html", import.meta.url), "utf8");
const recoveryScript = extractRecoveryScript(appHtml);

function createRecoveryDocument(url = "https://booking.example.test/askim") {
  const dom = new JSDOM(
    '<!doctype html><div id="boot"><div data-boot-part="loader"></div></div><div id="root"></div>',
    { runScripts: "outside-only", url }
  );
  const scheduledCallbacks: Array<() => void> = [];
  dom.window.setTimeout = vi.fn((callback: TimerHandler) => {
    if (typeof callback === "function") scheduledCallbacks.push(callback as () => void);
    return 1;
  }) as unknown as typeof dom.window.setTimeout;
  dom.window.clearTimeout = vi.fn();

  return { dom, scheduledCallbacks };
}

describe("SvelteKit asset recovery", () => {
  it("fjerner bootflaten når appen har startet", () => {
    const { dom } = createRecoveryDocument();
    dom.window.eval(recoveryScript);

    dom.window.dispatchEvent(new dom.window.Event("banebooking:app-started"));

    expect(dom.window.document.getElementById("boot")).toBeNull();
    expect(dom.window.clearTimeout).toHaveBeenCalled();
  });

  it("avbryter Vite-feilen og viser manuell recovery innen cooldown", () => {
    const { dom } = createRecoveryDocument(
      `https://booking.example.test/askim?_app_reload=${Date.now()}`
    );
    const fetch = vi.fn();
    Object.defineProperty(dom.window, "fetch", { value: fetch, configurable: true });
    dom.window.eval(recoveryScript);

    const preloadError = new dom.window.CustomEvent("vite:preloadError", { cancelable: true });
    dom.window.dispatchEvent(preloadError);

    expect(preloadError.defaultPrevented).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
    expect(dom.window.document.querySelector("h1")?.textContent).toBe(
      "Siden trenger en ny innlasting"
    );
    expect(dom.window.document.querySelector("button")?.textContent).toBe(
      "Nullstill og last inn på nytt"
    );
  });

  it("henter fersk HTML og alle oppstartsassets én gang utenfor cooldown", async () => {
    const { dom } = createRecoveryDocument();
    const freshHtml = `<!doctype html>
      <div id="root"></div>
      <link rel="stylesheet" href="/_app/app.css">
      <link rel="modulepreload" href="/_app/shared.js">
      <script type="module" src="/_app/start.js"></script>`;
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, text: async () => freshHtml })
      .mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) });
    Object.defineProperty(dom.window, "fetch", { value: fetch, configurable: true });
    dom.window.eval(recoveryScript);

    const preloadError = new dom.window.CustomEvent("vite:preloadError", { cancelable: true });
    dom.window.dispatchEvent(preloadError);

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
    expect(fetch.mock.calls[0][0]).toMatch(
      /^https:\/\/booking\.example\.test\/askim\?_app_reload=/
    );
    expect(fetch.mock.calls[0][1]).toEqual({
      cache: "no-store",
      headers: { Accept: "text/html" },
    });
    expect(fetch.mock.calls.slice(1).map(([url]) => url)).toEqual([
      "https://booking.example.test/_app/app.css",
      "https://booking.example.test/_app/shared.js",
      "https://booking.example.test/_app/start.js",
    ]);
  });

  it("tilbyr recoverymelding når oppstarten varer for lenge", () => {
    const { dom, scheduledCallbacks } = createRecoveryDocument();
    dom.window.eval(recoveryScript);

    expect(scheduledCallbacks).toHaveLength(1);
    scheduledCallbacks[0]();

    expect(dom.window.document.querySelector('[data-boot-part="recovery"]')).not.toBeNull();
  });
});

function extractRecoveryScript(html: string) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  const script = scripts.find((candidate) => candidate.includes("vite:preloadError"));
  if (!script) throw new Error("Fant ikke asset-recovery i src/app.html.");
  return script;
}
