import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { Labels } from "react-day-picker";

function formatTilgjengeligDato(date: Date) {
  return format(date, "PPPP", { locale: nb });
}

export const norskKalenderLocale = nb;

export const norskeKalenderEtiketter = {
  labelNav: () => "Kalendernavigasjon",
  labelNext: () => "Neste måned",
  labelPrevious: () => "Forrige måned",
  labelDayButton: (date, modifiers) => {
    const dato = formatTilgjengeligDato(date);
    const iDag = modifiers.today ? "I dag, " : "";
    const valgt = modifiers.selected ? ", valgt" : "";
    return `${iDag}${dato}${valgt}`;
  },
  labelGridcell: (date, modifiers) => {
    const dato = formatTilgjengeligDato(date);
    return modifiers?.today ? `I dag, ${dato}` : dato;
  },
} satisfies Partial<Labels>;
