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

  it("bevarer Vite-feilen og tilbyr origin-sikker recovery innen cooldown", async () => {
    const { dom } = createRecoveryDocument(
      `https://booking.example.test/askim?_app_reload=${Date.now()}`
    );
    const localStore = storageFor(dom, "local");
    const sessionStore = storageFor(dom, "session");
    localStore.setItem("supabase.auth.token", "behold-auth");
    sessionStore.setItem("annen-app-state", "behold-state");
    const freshHtml =
      '<!doctype html><div id="root"></div><script type="module" src="/_app/start.js"></script>';
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, text: async () => freshHtml })
      .mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) });
    Object.defineProperty(dom.window, "fetch", { value: fetch, configurable: true });
    dom.window.eval(recoveryScript);

    const preloadError = new dom.window.CustomEvent("vite:preloadError", { cancelable: true });
    dom.window.dispatchEvent(preloadError);

    expect(preloadError.defaultPrevented).toBe(false);
    expect(
      dom.window.document.documentElement.getAttribute("data-banebooking-asset-recovery")
    ).toBe("true");
    expect(fetch).not.toHaveBeenCalled();
    expect(dom.window.document.querySelector("h1")?.textContent).toBe(
      "Siden trenger en ny innlasting"
    );
    const button = dom.window.document.querySelector("button");
    expect(button?.textContent).toBe("Last inn nyeste versjon");

    button?.click();

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(localStore.getItem("supabase.auth.token")).toBe("behold-auth");
    expect(sessionStore.getItem("annen-app-state")).toBe("behold-state");
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

  it("gjenoppretter recoveryflaten når en utdatert route feiler etter appstart", () => {
    const { dom } = createRecoveryDocument(
      `https://booking.example.test/askim?_app_reload=${Date.now()}`
    );
    Object.defineProperty(dom.window, "fetch", { value: vi.fn(), configurable: true });
    dom.window.eval(recoveryScript);
    dom.window.dispatchEvent(new dom.window.Event("banebooking:app-started"));

    expect(dom.window.document.getElementById("boot")).toBeNull();

    const preloadError = new dom.window.CustomEvent("vite:preloadError", { cancelable: true });
    dom.window.dispatchEvent(preloadError);

    expect(preloadError.defaultPrevented).toBe(false);
    expect(dom.window.document.querySelector("#boot h1")?.textContent).toBe(
      "Siden trenger en ny innlasting"
    );
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

function storageFor(dom: JSDOM, scope: "local" | "session") {
  return Reflect.get(dom.window, `${scope}Storage`) as Storage;
}
