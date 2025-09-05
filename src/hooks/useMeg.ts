import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  hentMeg,
  oppdaterMeg,
  slettMeg as slettMegApi,
  lastNedEgenData as lastNedEgenDataApi,
} from "../api/meg.js";
import type { BrukerDto } from "../types/index.js";

export function useMeg(slug?: string) {
  const queryClient = useQueryClient();

  // Hent bruker
  const brukerQuery = useQuery<BrukerDto, Error>({
    queryKey: ["meg", slug],
    queryFn: () => hentMeg(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 1, // 1 minutt
    onError: (err) => toast.error(err.message ?? "Kunne ikke hente brukerdata"),
  });

  // Oppdater visningsnavn
  const oppdaterVisningsnavn = useMutation<void, Error, string>({
    mutationFn: (visningsnavn) => oppdaterMeg(slug!, { visningsnavn }),
    onSuccess: (_, visningsnavn) => {
      queryClient.setQueryData<BrukerDto>(["meg", slug], (old) =>
        old ? { ...old, visningsnavn } : old
      );
      toast.success("Visningsnavn lagret");
    },
    onError: (err) =>
      toast.error(err.message ?? "Kunne ikke lagre visningsnavn"),
  });

  // Slett bruker
  const slettMeg = useMutation<void, Error>({
    mutationFn: () => slettMegApi(slug!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["meg", slug] });
      toast.success("Brukeren er slettet");
    },
    onError: (err) => toast.error(err.message ?? "Kunne ikke slette bruker"),
  });

  // Last ned egen data
  const lastNedEgenData = async () => {
    if (!slug) return;
    try {
      await lastNedEgenDataApi(slug);
      toast.success("Dataen din lastes nå ned");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunne ikke laste ned data";
      toast.error(message);
    }
  };

  return {
    bruker: brukerQuery.data,
    laster: brukerQuery.isLoading,
    feil: brukerQuery.error,
    refetch: brukerQuery.refetch,
    oppdaterVisningsnavn,
    slettMeg, // 👉 nå returnerer vi hele mutation-objektet
    lastNedEgenData,
  };
}
