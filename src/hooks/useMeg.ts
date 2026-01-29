import api from "@/api/api";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { BrukerDto } from "@/types";
import { useSlug } from "@/hooks/useSlug";

type OppdaterMegDto = {
    visningsnavn?: string;
};

export function useMeg() {
    const slug = useSlug();

    const megQuery = useApiQuery<BrukerDto>(
        ["meg", slug],
        `/klubb/${slug}/bruker/meg`,
        {
            requireAuth: true,
            staleTime: 60_000,
        }
    );

    const oppdaterVisningsnavn = useApiMutation<OppdaterMegDto, void>(
        "patch",
        `/klubb/${slug}/bruker/meg`,
        {
            onSuccess: () => {
                toast.success("Visningsnavn oppdatert");
                void megQuery.refetch();
            },
            onError: (err) => {
                toast.error(err.message ?? "Kunne ikke oppdatere visningsnavn");
            },
        }
    );

    const slettMeg = useApiMutation<void, void>(
        "delete",
        `/klubb/${slug}/bruker/meg`,
        {
            onSuccess: () => toast.success("Brukeren er slettet"),
            onError: (err) => toast.error(err.message ?? "Kunne ikke slette bruker"),
        }
    );

    const lastNedEgenData = async () => {
        try {
            const res = await api.get(`/klubb/${slug}/bruker/meg/egen-data`, {
                requireAuth: true,
                responseType: "blob",
            });

            const blob = res.data as Blob;

            // prøv å hente filnavn fra Content-Disposition (backend setter filename)
            const disposition = res.headers?.["content-disposition"] as string | undefined;
            const match = disposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
            const fileNameFromHeader = decodeURIComponent(match?.[1] ?? match?.[2] ?? "");
            const fileName =
                fileNameFromHeader || `banebooking-data-${new Date().toISOString().slice(0, 10)}.json`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Kunne ikke laste ned egen data";

            toast.error(message);
        }
    };

    return {
        bruker: megQuery.data,
        laster: megQuery.isLoading,
        error: megQuery.error,
        refetch: megQuery.refetch,

        lastNedEgenData,

        oppdaterVisningsnavn,
        slettMeg, // viktig: returner hele UseMutationResult (for isPending osv.)
    };
}
