import type { TurneringKlasseRespons, KampFormat } from "@/types";

export function velgKampformat(klasse: TurneringKlasseRespons, erGruppeKamp: boolean): KampFormat {
  return erGruppeKamp && klasse.gruppespillKampFormat
    ? klasse.gruppespillKampFormat
    : klasse.sluttspillKampFormat;
}
