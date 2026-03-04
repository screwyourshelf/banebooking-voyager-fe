import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useKlubb } from "@/hooks/useKlubb";
import { useBaner } from "@/hooks/useBaner";
import { useSlug } from "@/hooks/useSlug";

import type {
  OpprettArrangementForespørsel,
  ArrangementForRedigeringRespons,
  ErstattArrangementRespons,
  ArrangementForhåndsvisningRespons,
} from "@/types";

function parseTimeToMinutes(tid: string) {
  const [h, m] = tid.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function genererTidspunkter(start: string, slutt: string, slotMinutter: number): string[] {
  const startMin = parseTimeToMinutes(start);
  const sluttMin = parseTimeToMinutes(slutt);
  const result: string[] = [];
  for (let t = startMin; t + slotMinutter <= sluttMin; t += slotMinutter) {
    result.push(minutesToTime(t));
  }
  return result;
}

const tomForhandsvisning: ArrangementForhåndsvisningRespons = { ledige: [], konflikter: [] };

export function useRedigerArrangement(valgtId: string | null) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const { data: klubb, isLoading: loadingKlubb } = useKlubb();
  const { baner, isLoading: loadingBaner } = useBaner(false);

  const { data: arrangement, isLoading: loadingArrangement } =
    useApiQuery<ArrangementForRedigeringRespons>(
      ["arrangement-redigering", slug, valgtId],
      `/klubb/${slug}/arrangement/${valgtId ?? ""}`,
      { requireAuth: true, enabled: !!valgtId }
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
    onError: (err) => toast.error(err.message ?? "Feil ved forhåndsvisning"),
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
        await queryClient.invalidateQueries({ queryKey: ["aktiveArrangementer", slug] });
        await queryClient.invalidateQueries({
          queryKey: ["arrangement-redigering", slug, valgtId],
        });
      },
      onError: (err) => toast.error(err.message ?? "Feil ved oppdatering"),
      retry: false,
    }
  );

  const erstatt = async (dto: OpprettArrangementForespørsel) => {
    const result = await erstattMutation.mutateAsync(dto);
    return { success: true as const, result };
  };

  return {
    arrangement,
    baner,
    tilgjengeligeTidspunkter,
    forhandsvisning,
    forhandsvis,
    clearForhandsvisning,
    erstatt,
    isLoading: loadingKlubb || loadingBaner,
    isLoadingArrangement: loadingArrangement,
    isLoadingForhandsvisning: forhandsvisMutation.isPending,
  };
}
