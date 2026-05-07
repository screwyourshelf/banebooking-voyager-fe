import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiPostQuery } from "@/hooks/useApiPostQuery";
import { useBaner } from "@/hooks/useBaner";
import { useGrener } from "@/hooks/useGrener";
import { useSlug } from "@/hooks/useSlug";
import { genererTidspunkter } from "../views/arrangement/arrangementUtils";

import type {
  OpprettArrangementForespørsel,
  OpprettArrangementRespons,
  ArrangementForhåndsvisningRespons,
  BookingRegelRespons,
} from "@/types";

const tomForhandsvisning: ArrangementForhåndsvisningRespons = { ledige: [], konflikter: [] };

// Stabil nøkkel
function dtoKey(dto: OpprettArrangementForespørsel) {
  const stable: OpprettArrangementForespørsel = {
    ...dto,
    ukedager: [...dto.ukedager].sort(),
    baneGrupper: dto.baneGrupper
      .map((g) => ({
        baneIder: [...g.baneIder].sort(),
        tidspunkter: [...g.tidspunkter].sort(),
      }))
      .sort((a, b) => a.baneIder[0]?.localeCompare(b.baneIder[0] ?? "") ?? 0),
  };

  return JSON.stringify(stable);
}

export function useArrangement(valgtGrenId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const { grener, isLoading: loadingGrener } = useGrener(false);
  const { baner, isLoading: loadingBaner } = useBaner(false);

  const valgtGren = useMemo(
    () => grener.find((g) => g.id === valgtGrenId) ?? null,
    [grener, valgtGrenId]
  );

  const tilgjengeligeTidspunkter = useMemo(() => {
    const regel: BookingRegelRespons | null = valgtGren?.bookingInnstillinger ?? null;
    if (!regel) return [];

    const start = regel.aapningstid || "08:00";
    const slutt = regel.stengetid || "22:00";
    const slot = regel.slotLengdeMinutter || 60;

    return genererTidspunkter(start, slutt, slot);
  }, [valgtGren]);

  // ───────── Preview (POST-query) ─────────
  const [sisteForhandsvisDto, setSisteForhandsvisDto] =
    useState<OpprettArrangementForespørsel | null>(null);

  const forhandsvisKey = sisteForhandsvisDto
    ? (["arrangement-forhandsvis", slug, dtoKey(sisteForhandsvisDto)] as const)
    : (["arrangement-forhandsvis", slug, "empty"] as const);

  const forhandsvisQuery = useApiPostQuery<
    ArrangementForhåndsvisningRespons,
    OpprettArrangementForespørsel
  >(forhandsvisKey, `/klubb/${slug}/arrangement/forhandsvis`, sisteForhandsvisDto, {
    requireAuth: true,
    enabled: !!sisteForhandsvisDto,
    staleTime: 60_000,
    retry: false,
  });

  const forhandsvisning = forhandsvisQuery.data ?? tomForhandsvisning;
  const isLoadingForhandsvisning = forhandsvisQuery.isFetching;

  const forhandsvis = async (dto: OpprettArrangementForespørsel) => {
    setSisteForhandsvisDto(dto);
    return { success: true as const };
  };

  const clearForhandsvisning = () => {
    setSisteForhandsvisDto(null);
    void queryClient.cancelQueries({ queryKey: ["arrangement-forhandsvis", slug] });
    queryClient.removeQueries({ queryKey: ["arrangement-forhandsvis", slug] });
  };

  // ───────── Opprett ─────────
  const opprettMutation = useApiMutation<OpprettArrangementForespørsel, OpprettArrangementRespons>(
    "post",
    `/klubb/${slug}/arrangement`,
    {
      onSuccess: async (result) => {
        clearForhandsvisning();
        if (result.antallOpprettet === 0) {
          toast.warning("Ingen bookinger ble opprettet – alle tidspunkter er allerede booket.");
        } else if (result.konflikter.length > 0) {
          toast.warning(
            `${result.antallOpprettet} bookinger opprettet. ${result.konflikter.length} tidspunkt${
              result.konflikter.length === 1 ? "" : "er"
            } hadde konflikter og ble hoppet over.`
          );
        } else {
          toast.success(`${result.antallOpprettet} bookinger opprettet.`);
        }

        // Hvis du har en liste over "kommende arrangementer", invalidér den her:
        // await queryClient.invalidateQueries({ queryKey: ["kommende-arrangementer", slug] });
        // eller (hvis dere fortsatt bruker den gamle):
        // await queryClient.invalidateQueries({ queryKey: ["arrangementer", slug] });
      },
      retry: false,
    }
  );

  const opprett = async (dto: OpprettArrangementForespørsel) => {
    const result = await opprettMutation.mutateAsync(dto);
    return { success: true as const, result };
  };

  return {
    grener,
    baner,
    tilgjengeligeTidspunkter,

    forhandsvisning,
    forhandsvis,
    clearForhandsvisning,

    opprett,
    opprettFeil: opprettMutation.error,

    isLoading: loadingGrener || loadingBaner,
    isLoadingForhandsvisning,
  };
}
