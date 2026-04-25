import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { GrenRespons, OpprettGrenForespørsel, OppdaterGrenForespørsel } from "@/types";
import { useSlug } from "@/hooks/useSlug";

export function useGrener(inkluderInaktive = true) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["grener", slug] });
    void queryClient.invalidateQueries({ queryKey: ["grener", slug, true] });
    void queryClient.invalidateQueries({ queryKey: ["grener", slug, false] });
    void queryClient.invalidateQueries({ queryKey: ["baner", slug] });
  };

  const grenerQuery = useApiQuery<GrenRespons[]>(
    ["grener", slug, inkluderInaktive],
    `/klubb/${slug}/grener${inkluderInaktive ? "?inkluderInaktive=true" : ""}`,
    {
      staleTime: 1000 * 60 * 5,
      requireAuth: false,
    }
  );

  const opprettGren = useApiMutation<OpprettGrenForespørsel, void>(
    "post",
    `/klubb/${slug}/grener`,
    {
      onSuccess: () => {
        toast.success("Gren opprettet");
        invalidateAll();
      },
    }
  );

  const oppdaterGren = useApiMutation<{ id: string; dto: OppdaterGrenForespørsel }, void>(
    "put",
    ({ id }) => `/klubb/${slug}/grener/${id}`,
    {
      getBody: ({ dto }) => dto,
      onSuccess: () => {
        toast.success("Gren oppdatert");
        invalidateAll();
      },
    }
  );

  const deaktiverGren = useApiMutation<{ id: string }, void>(
    "delete",
    ({ id }) => `/klubb/${slug}/grener/${id}`,
    {
      onSuccess: () => {
        toast.success("Gren deaktivert");
        invalidateAll();
      },
    }
  );

  const aktiverGren = useApiMutation<{ id: string }, void>(
    "put",
    ({ id }) => `/klubb/${slug}/grener/${id}/aktiver`,
    {
      getBody: () => ({}),
      onSuccess: () => {
        toast.success("Gren aktivert");
        invalidateAll();
      },
    }
  );

  return {
    grener: grenerQuery.data ?? [],
    isLoading: grenerQuery.isLoading,
    isFetching: grenerQuery.isFetching,
    error: grenerQuery.error,
    refetch: grenerQuery.refetch,

    opprettGren,
    oppdaterGren,
    deaktiverGren,
    aktiverGren,
  };
}
