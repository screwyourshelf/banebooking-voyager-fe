import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fjernFraLokalLagring,
  lesLokalLagring,
  lesSessionLagring,
  lokalLagringErTilgjengelig,
  settLagringsfeilReporter,
  skrivLokalLagring,
  skrivSessionLagring,
  supabaseAuthStorage,
} from "@/utils/browserStorage";

function lagMinneLagring(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

function lagBlokkertLagring(): Storage {
  const blokkert = () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  };

  return {
    get length() {
      return 0;
    },
    clear: blokkert,
    getItem: blokkert,
    key: () => null,
    removeItem: blokkert,
    setItem: blokkert,
  };
}

beforeEach(() => {
  vi.stubGlobal("window", {
    localStorage: lagMinneLagring(),
    sessionStorage: lagMinneLagring(),
  });
  settLagringsfeilReporter(null);
});

afterEach(() => {
  settLagringsfeilReporter(null);
  vi.unstubAllGlobals();
});

describe("browserStorage", () => {
  it("leser, skriver og fjerner verdier når lagring er tilgjengelig", () => {
    expect(skrivLokalLagring("slug", "aas-tennisklubb")).toBe(true);
    expect(lesLokalLagring("slug")).toBe("aas-tennisklubb");
    expect(fjernFraLokalLagring("slug")).toBe(true);
    expect(lesLokalLagring("slug")).toBeNull();

    expect(skrivSessionLagring("valgt", "42")).toBe(true);
    expect(lesSessionLagring("valgt")).toBe("42");
  });

  it("returnerer trygge standardverdier når nettleseren blokkerer lagring", () => {
    vi.stubGlobal("window", {
      localStorage: lagBlokkertLagring(),
      sessionStorage: lagBlokkertLagring(),
    });

    expect(() => lesLokalLagring("supabase_token")).not.toThrow();
    expect(lesLokalLagring("supabase_token")).toBeNull();
    expect(skrivLokalLagring("supabase_token", "token")).toBe(false);
    expect(lesSessionLagring("valgt")).toBeNull();
  });

  it("rapporterer høyst én lagringsfeil per sidevisning uten nøkkel eller verdi", () => {
    const reporter = vi.fn();
    vi.stubGlobal("window", {
      localStorage: lagBlokkertLagring(),
      sessionStorage: lagBlokkertLagring(),
    });
    settLagringsfeilReporter(reporter);

    lesLokalLagring("supabase_token");
    skrivLokalLagring("supabase_token", "hemmelig-token");
    lesSessionLagring("rediger.valgtBaneId");

    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter).toHaveBeenCalledWith({
      lagringstype: "localStorage",
      operasjon: "les",
      feil: expect.any(DOMException),
    });
    expect(JSON.stringify(reporter.mock.calls)).not.toContain("supabase_token");
    expect(JSON.stringify(reporter.mock.calls)).not.toContain("hemmelig-token");
  });

  it("kontrollerer både skrive- og slettetilgang før innlogging", () => {
    expect(lokalLagringErTilgjengelig()).toBe(true);
    expect(lesLokalLagring("__banebooking_local_storage_probe__")).toBeNull();

    vi.stubGlobal("window", {
      localStorage: lagBlokkertLagring(),
      sessionStorage: lagMinneLagring(),
    });

    expect(lokalLagringErTilgjengelig()).toBe(false);
  });

  it("lar Supabase-adapteren degradere uten å kaste feil", () => {
    vi.stubGlobal("window", {
      localStorage: lagBlokkertLagring(),
      sessionStorage: lagMinneLagring(),
    });

    expect(() => supabaseAuthStorage.getItem("session")).not.toThrow();
    expect(supabaseAuthStorage.getItem("session")).toBeNull();
    expect(() => supabaseAuthStorage.setItem("session", "verdi")).not.toThrow();
    expect(() => supabaseAuthStorage.removeItem("session")).not.toThrow();
  });
});
