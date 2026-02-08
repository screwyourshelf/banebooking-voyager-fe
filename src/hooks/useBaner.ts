import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import api from "@/api/api";
import type { BaneRespons, OpprettBaneForespørsel, OppdaterBaneForespørsel } from "@/types";
import { useSlug } from "@/hooks/useSlug";

export function useBaner(inkluderInaktive = true) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["baner", slug] });
    void queryClient.invalidateQueries({ queryKey: ["baner", slug, true] });
    void queryClient.invalidateQueries({ queryKey: ["baner", slug, false] });
  };

  const banerQuery = useApiQuery<BaneRespons[]>(
    ["baner", slug, inkluderInaktive],
    `/klubb/${slug}/baner${inkluderInaktive ? "?inkluderInaktive=true" : ""}`,
    {
      staleTime: 1000 * 60 * 5,
      requireAuth: false,
    }
  );

  const errorToastetRef = useRef(false);
  useEffect(() => {
    if (!banerQuery.error) {
      errorToastetRef.current = false;
      return;
    }
    if (errorToastetRef.current) return;

    toast.error(banerQuery.error.message ?? "Kunne ikke hente baner");
    errorToastetRef.current = true;
  }, [banerQuery.error]);

  const opprettBane = useApiMutation<OpprettBaneForespørsel, void>("post", `/klubb/${slug}/baner`, {
    onSuccess: () => {
      toast.success("Bane opprettet");
      invalidateAll();
    },
    onError: (err) => toast.error(err.message ?? "Kunne ikke opprette bane"),
  });

  const oppdaterBane = useApiMutation<{ id: string; dto: OppdaterBaneForespørsel }, void>(
    "put",
    "/",
    {
      mutationFn: async ({ id, dto }) => {
        await api.put<void>(`/klubb/${slug}/baner/${id}`, dto, { requireAuth: true });
      },
      onSuccess: () => {
        toast.success("Bane oppdatert");
        invalidateAll();
      },
      onError: (err) => toast.error(err.message ?? "Kunne ikke oppdatere bane"),
    }
  );

  return {
    baner: banerQuery.data ?? [],
    isLoading: banerQuery.isLoading,
    error: banerQuery.error,
    refetch: banerQuery.refetch,

    opprettBane,
    oppdaterBane,
  };
}
