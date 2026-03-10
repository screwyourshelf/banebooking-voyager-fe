import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useKlubb } from "@/hooks/useKlubb";
import { useBaner } from "@/hooks/useBaner";
import { useSlug } from "@/hooks/useSlug";
import { genererTidspunkter } from "../views/arrangement/arrangementUtils";

import type {
  OpprettArrangementForespørsel,
  ArrangementRespons,
  ErstattArrangementRespons,
  ArrangementForhåndsvisningRespons,
} from "@/types";

const tomForhandsvisning: ArrangementForhåndsvisningRespons = { ledige: [], konflikter: [] };

export function useRedigerArrangement(valgtId: string | null) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const { data: klubb, isLoading: loadingKlubb } = useKlubb();
  const { baner, isLoading: loadingBaner } = useBaner(false);

  const { data: arrangementer, isLoading: loadingArrangementer } = useApiQuery<
    ArrangementRespons[]
  >(["arrangementer-admin", slug], `/klubb/${slug}/arrangementer`, {
    requireAuth: true,
    staleTime: 30_000,
  });

  const arrangement = useMemo(
    () => arrangementer?.find((a) => a.id === valgtId) ?? null,
    [arrangementer, valgtId]
  );

  const tilgjengeligeTidspunkter = useMemo(() => {
    const regel = klubb?.bookingRegel;
    if (!regel) return [];
    const start = regel.aapningstid || "08:00";
    const slutt = regel.stengetid || "22:00";
    const slot = regel.slotLengdeMinutter || 60;
    return genererTidspunkter(start, slutt, slot);
  }, [klubb?.bookingRegel]);

  const [forhandsvisning, setForhandsvisning] =
    useState<ArrangementForhåndsvisningRespons>(tomForhandsvisning);

  useEffect(() => {
    setForhandsvisning(tomForhandsvisning);
  }, [valgtId]);

  const clearForhandsvisning = () => setForhandsvisning(tomForhandsvisning);

  const forhandsvisMutation = useApiMutation<
    OpprettArrangementForespørsel,
    ArrangementForhåndsvisningRespons
  >("put", `/klubb/${slug}/arrangement/${valgtId ?? ""}/forhandsvis`, {
    onSuccess: (result) => setForhandsvisning(result),
    retry: false,
  });

  const forhandsvis = async (dto: OpprettArrangementForespørsel) => {
    await forhandsvisMutation.mutateAsync(dto);
    return { success: true as const };
  };

  const erstattMutation = useApiMutation<OpprettArrangementForespørsel, ErstattArrangementRespons>(
    "put",
    `/klubb/${slug}/arrangement/${valgtId ?? ""}`,
    {
      onSuccess: async (result) => {
        clearForhandsvisning();
        let melding = `${result.antallOpprettet} bookinger oppdatert`;
        if (result.antallPaameldingFjernet > 0)
          melding += `, ${result.antallPaameldingFjernet} påmelding(er) fjernet`;
        toast.success(melding);
        await queryClient.invalidateQueries({ queryKey: ["arrangementer-admin", slug] });
      },
      retry: false,
    }
  );

  const erstatt = async (dto: OpprettArrangementForespørsel) => {
    const result = await erstattMutation.mutateAsync(dto);
    return { success: true as const, result };
  };

  return {
    arrangementer,
    arrangement,
    baner,
    tilgjengeligeTidspunkter,
    forhandsvisning,
    forhandsvis,
    clearForhandsvisning,
    erstatt,
    erstattFeil: erstattMutation.error,
    forhandsvisFeil: forhandsvisMutation.error,
    isLoading: loadingKlubb || loadingBaner,
    isLoadingArrangementer: loadingArrangementer,
    isLoadingForhandsvisning: forhandsvisMutation.isPending,
  };
}
