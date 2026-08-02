import { useCallback, useMemo, useState } from "react";
import type { BaneRespons, GrenRespons } from "@/types";
import { tilDatoTekst } from "@/utils/datoUtils";

type Params = {
  grener: GrenRespons[];
  baner: BaneRespons[];
};

export function useBookingSelection({ grener, baner }: Params) {
  const [manuellGrenId, setManuellGrenId] = useState<string | null>(null);
  const [manuellBaneId, setManuellBaneId] = useState<string | null>(null);
  const [valgtDato, setValgtDato] = useState<Date | null>(() => new Date());

  const standardGrenId = useMemo(
    () =>
      grener.find((gren) => baner.some((bane) => bane.grenId === gren.id))?.id ??
      grener[0]?.id ??
      "",
    [grener, baner]
  );

  const valgtGrenId =
    manuellGrenId && grener.some((gren) => gren.id === manuellGrenId)
      ? manuellGrenId
      : standardGrenId;

  const filtrerteBaner = useMemo(
    () => (valgtGrenId ? baner.filter((bane) => bane.grenId === valgtGrenId) : baner),
    [baner, valgtGrenId]
  );

  const valgtBaneId =
    manuellBaneId && filtrerteBaner.some((bane) => bane.id === manuellBaneId)
      ? manuellBaneId
      : (filtrerteBaner[0]?.id ?? "");

  const handleGrenChange = useCallback((grenId: string) => {
    setManuellGrenId(grenId);
  }, []);

  const handleBaneChange = useCallback((baneId: string) => {
    setManuellBaneId(baneId);
  }, []);

  const handleDatoChange = useCallback((dato: Date | null) => {
    setValgtDato(dato);
  }, []);

  return {
    valgtGrenId,
    filtrerteBaner,
    valgtBaneId,
    valgtDato,
    valgtDatoStr: valgtDato ? tilDatoTekst(valgtDato) : "",
    handleGrenChange,
    handleBaneChange,
    handleDatoChange,
  };
}
