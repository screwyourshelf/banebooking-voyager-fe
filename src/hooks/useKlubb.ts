import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hentKlubb, oppdaterKlubb } from "@/api/klubb.js";
import type { KlubbDetaljer, OppdaterKlubb } from "@/types/index.js";

export function useKlubb(slug?: string) {
  const queryClient = useQueryClient();

  // Hent klubbinfo
  const klubbQuery = useQuery<KlubbDetaljer, Error>({
    queryKey: ["klubb", slug],
    queryFn: () => hentKlubb(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 min cache
    onError: (err) => {
      toast.error(err.message ?? "Kunne ikke hente klubb");
    },
  });

  // Oppdater klubbinfo
  const oppdaterKlubbMutation = useMutation<void, Error, OppdaterKlubb>({
    mutationFn: (data) => oppdaterKlubb(slug!, data),
    onSuccess: () => {
      toast.success("Klubb oppdatert");
      queryClient.invalidateQueries({ queryKey: ["klubb", slug] });
    },
    onError: (err) => {
      toast.error(err.message ?? "Kunne ikke oppdatere klubb");
    },
  });

  return {
    // Query-data
    data: klubbQuery.data,
    isLoading: klubbQuery.isLoading,
    error: klubbQuery.error,
    refetch: klubbQuery.refetch,

    // Mutasjon
    oppdaterKlubb: oppdaterKlubbMutation,
  };
}
