import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  hentMeg,
  oppdaterMeg,
  lastNedEgenData,
  slettMeg,
} from "@/api/meg";
import type { BrukerDto } from "@/types/index.js";

export function useMeg(slug: string | undefined) {
  const queryClient = useQueryClient();

  // Hent brukerinfo
  const {
    data: bruker,
    isLoading: laster,
    error,
    refetch,
  } = useQuery<BrukerDto, Error>({
    queryKey: ["meg", slug],
    queryFn: () => hentMeg(slug!),
    enabled: !!slug,
    staleTime: 60_000,
    onError: (err) => {
      toast.error(err.message ?? "Kunne ikke hente brukerinfo");
    },
  });

  // Oppdater visningsnavn eller andre brukerdata
  const oppdaterVisningsnavn = useMutation({
    mutationFn: (visningsnavn: string) =>
      oppdaterMeg(slug!, { visningsnavn }),
    onSuccess: () => {
      toast.success("Visningsnavn oppdatert");
      queryClient.invalidateQueries({ queryKey: ["meg", slug] });
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Kunne ikke oppdatere visningsnavn"
      );
    },
  });

  // Last ned egen data
  const lastNedData = async () => {
    try {
      await lastNedEgenData(slug!);
      toast.success("Data lastet ned");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Kunne ikke laste ned data"
      );
    }
  };

  // Slett bruker
  const slett = useMutation({
    mutationFn: () => slettMeg(slug!),
    onSuccess: () => {
      toast.success("Brukeren er slettet");
      queryClient.removeQueries({ queryKey: ["meg", slug] });
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Kunne ikke slette bruker"
      );
    },
  });

  return {
    bruker,
    laster,
    error,
    refetch,
    oppdaterVisningsnavn,
    lastNedEgenData: lastNedData,
    slettMeg: slett.mutate,
  };
}
