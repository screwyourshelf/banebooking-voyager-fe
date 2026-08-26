export type Nettleserlagringstype = "localStorage" | "sessionStorage";
export type Lagringsoperasjon = "les" | "skriv" | "fjern" | "tilgjengelighet";

export type Lagringsfeil = {
  lagringstype: Nettleserlagringstype;
  operasjon: Lagringsoperasjon;
  feil: unknown;
};

type LagringsfeilReporter = (feil: Lagringsfeil) => void;

let lagringsfeilReporter: LagringsfeilReporter | null = null;
let harRapportertLagringsfeil = false;

export function settLagringsfeilReporter(reporter: LagringsfeilReporter | null) {
  lagringsfeilReporter = reporter;
  harRapportertLagringsfeil = false;
}

function rapporterLagringsfeil(feil: Lagringsfeil) {
  if (harRapportertLagringsfeil) return;
  harRapportertLagringsfeil = true;

  try {
    lagringsfeilReporter?.(feil);
  } catch {
    // Lagringsfeil skal aldri få appen til å stoppe, heller ikke hvis rapportering feiler.
  }
}

function hentLagring(lagringstype: Nettleserlagringstype) {
  return window[lagringstype];
}

function lesFraLagring(lagringstype: Nettleserlagringstype, key: string) {
  try {
    return hentLagring(lagringstype).getItem(key);
  } catch (feil) {
    rapporterLagringsfeil({ lagringstype, operasjon: "les", feil });
    return null;
  }
}

function skrivTilLagring(lagringstype: Nettleserlagringstype, key: string, value: string) {
  try {
    hentLagring(lagringstype).setItem(key, value);
    return true;
  } catch (feil) {
    rapporterLagringsfeil({ lagringstype, operasjon: "skriv", feil });
    return false;
  }
}

function fjernFraLagring(lagringstype: Nettleserlagringstype, key: string) {
  try {
    hentLagring(lagringstype).removeItem(key);
    return true;
  } catch (feil) {
    rapporterLagringsfeil({ lagringstype, operasjon: "fjern", feil });
    return false;
  }
}

export function lesLokalLagring(key: string) {
  return lesFraLagring("localStorage", key);
}

export function skrivLokalLagring(key: string, value: string) {
  return skrivTilLagring("localStorage", key, value);
}

export function fjernFraLokalLagring(key: string) {
  return fjernFraLagring("localStorage", key);
}

export function lesSessionLagring(key: string) {
  return lesFraLagring("sessionStorage", key);
}

export function skrivSessionLagring(key: string, value: string) {
  return skrivTilLagring("sessionStorage", key, value);
}

export function fjernFraSessionLagring(key: string) {
  return fjernFraLagring("sessionStorage", key);
}

export function lokalLagringErTilgjengelig() {
  const probeKey = "__banebooking_local_storage_probe__";

  try {
    const storage = hentLagring("localStorage");
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return true;
  } catch (feil) {
    rapporterLagringsfeil({
      lagringstype: "localStorage",
      operasjon: "tilgjengelighet",
      feil,
    });
    return false;
  }
}

/**
 * Supabase støtter en egen Storage-implementasjon. Adapteren gjør at SDK-en
 * følger samme feilstrategi som resten av appen når nettleserlagring blokkeres.
 */
export const supabaseAuthStorage = {
  getItem: (key: string) => lesLokalLagring(key),
  setItem: (key: string, value: string) => {
    skrivLokalLagring(key, value);
  },
  removeItem: (key: string) => {
    fjernFraLokalLagring(key);
  },
};
