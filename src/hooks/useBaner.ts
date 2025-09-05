import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  hentBaner,
  oppdaterBane as apiOppdaterBane,
  opprettBane as apiOpprettBane,
} from "@/api/baner.js";
import type { Bane, NyBane, OppdaterBane } from "@/types";

export function useBaner(slug: string, inkluderInaktive = true) {
  const queryClient = useQueryClient();

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["baner", slug] });
    queryClient.invalidateQueries({ queryKey: ["baner", slug, true] });
    queryClient.invalidateQueries({ queryKey: ["baner", slug, false] });
  }

  const banerQuery = useQuery<Bane[], Error>({
    queryKey: ["baner", slug, inkluderInaktive],
    queryFn: () => hentBaner(slug, inkluderInaktive),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    onError: (err) => toast.error(err.message ?? "Kunne ikke hente baner"),
  });

  const opprettBane = useMutation<void, Error, NyBane>({
    mutationFn: (dto) => apiOpprettBane(slug, dto),
    onSuccess: () => {
      toast.success("Bane opprettet");
      invalidateAll();
    },
    onError: (err) => toast.error(err.message ?? "Kunne ikke opprette bane"),
  });

  const oppdaterBane = useMutation<void, Error, { id: string; dto: OppdaterBane }>({
    mutationFn: ({ id, dto }) => apiOppdaterBane(slug, id, dto),
    onSuccess: () => {
      toast.success("Bane oppdatert");
      invalidateAll();
    },
    onError: (err) => toast.error(err.message ?? "Kunne ikke oppdatere bane"),
  });

  return {
    baner: banerQuery.data ?? [],
    isLoading: banerQuery.isLoading,
    error: banerQuery.error,
    refetch: banerQuery.refetch,

    opprettBane,
    oppdaterBane,
  };
}
