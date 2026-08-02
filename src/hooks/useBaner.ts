import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type {
  BaneRespons,
  OpprettBaneForespørsel,
  OppdaterBaneForespørsel,
  OppdaterBaneBookingInnstillingerForespørsel,
} from "@/types";
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

  const opprettBane = useApiMutation<OpprettBaneForespørsel, void>("post", `/klubb/${slug}/baner`, {
    onSuccess: () => {
      invalidateAll();
    },
  });

  const oppdaterBane = useApiMutation<{ id: string; dto: OppdaterBaneForespørsel }, void>(
    "put",
    ({ id }) => `/klubb/${slug}/baner/${id}`,
    {
      getBody: ({ dto }) => dto,
      onSuccess: () => {
        invalidateAll();
      },
    }
  );

  const oppdaterBookingInnstillinger = useApiMutation<
    { id: string; dto: OppdaterBaneBookingInnstillingerForespørsel },
    void
  >("put", ({ id }) => `/klubb/${slug}/baner/${id}/booking-innstillinger`, {
    getBody: ({ dto }) => dto,
    onSuccess: () => {
      invalidateAll();
    },
  });

  return {
    baner: banerQuery.data ?? [],
    isLoading: banerQuery.isLoading,
    isFetching: banerQuery.isFetching,
    error: banerQuery.error,
    refetch: banerQuery.refetch,

    opprettBane,
    oppdaterBane,
    oppdaterBookingInnstillinger,
  };
}
