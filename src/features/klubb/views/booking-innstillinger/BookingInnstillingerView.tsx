import { useEffect, useMemo, useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import { useKlubb } from "@/hooks/useKlubb";

import BookingInnstillingerContent from "./BookingInnstillingerContent";

type BookingRegelForm = {
    maksPerDag: number;
    maksTotalt: number;
    dagerFremITid: number;
    slotLengdeMinutter: number;
    aapningstid: string; // "07:00"
    stengetid: string; // "22:00"
};

function timeToHour(t: string): number {
    const h = parseInt((t ?? "").split(":")[0] ?? "0", 10);
    return Number.isFinite(h) ? h : 0;
}

function hourToTime(h: number): string {
    const hh = String(h).padStart(2, "0");
    return `${hh}:00`;
}

export default function BookingInnstillingerView() {
    const { data: klubb, isLoading, oppdaterKlubb } = useKlubb();

    const [booking, setBooking] = useState<BookingRegelForm>({
        maksPerDag: 1,
        maksTotalt: 2,
        dagerFremITid: 7,
        slotLengdeMinutter: 60,
        aapningstid: "07:00",
        stengetid: "22:00",
    });

    useEffect(() => {
        if (!klubb?.bookingRegel) return;

        setBooking({
            maksPerDag: klubb.bookingRegel.maksPerDag ?? 1,
            maksTotalt: klubb.bookingRegel.maksTotalt ?? 2,
            dagerFremITid: klubb.bookingRegel.dagerFremITid ?? 7,
            slotLengdeMinutter: klubb.bookingRegel.slotLengdeMinutter ?? 60,
            aapningstid: klubb.bookingRegel.aapningstid ?? "07:00",
            stengetid: klubb.bookingRegel.stengetid ?? "22:00",
        });
    }, [klubb]);

    const aapningHour = useMemo(() => timeToHour(booking.aapningstid), [booking.aapningstid]);
    const stengeHour = useMemo(() => timeToHour(booking.stengetid), [booking.stengetid]);

    // Sørg for at åpning alltid er før stengetid (minst 1 time mellom)
    useEffect(() => {
        if (aapningHour >= stengeHour) {
            const nyStenge = Math.min(23, aapningHour + 1);
            setBooking((b) => ({ ...b, stengetid: hourToTime(nyStenge) }));
        }
    }, [aapningHour, stengeHour]);

    const canSubmit = useMemo(() => {
        if (!klubb?.bookingRegel) return false;
        const r = klubb.bookingRegel;

        return (
            booking.maksPerDag !== (r.maksPerDag ?? 1) ||
            booking.maksTotalt !== (r.maksTotalt ?? 2) ||
            booking.dagerFremITid !== (r.dagerFremITid ?? 7) ||
            booking.slotLengdeMinutter !== (r.slotLengdeMinutter ?? 60) ||
            booking.aapningstid !== (r.aapningstid ?? "07:00") ||
            booking.stengetid !== (r.stengetid ?? "22:00")
        );
    }, [klubb, booking]);

    if (isLoading || !klubb) return <LoaderSkeleton />;

    const submit = () => {
        oppdaterKlubb.mutate({
            navn: klubb.navn ?? "",
            kontaktEpost: klubb.kontaktEpost ?? "",
            banereglement: klubb.banereglement ?? "",

            latitude: klubb.latitude ?? null,
            longitude: klubb.longitude ?? null,

            feedUrl: klubb.feedUrl ?? null,
            feedSynligAntallDager: klubb.feedSynligAntallDager ?? 7,

            bookingRegel: booking,
        });
    };

    return (
        <BookingInnstillingerContent
            aapningHour={aapningHour}
            stengeHour={stengeHour}
            booking={{
                maksPerDag: booking.maksPerDag,
                maksTotalt: booking.maksTotalt,
                dagerFremITid: booking.dagerFremITid,
                slotLengdeMinutter: booking.slotLengdeMinutter,
            }}
            onChangeAapningHour={(val) => {
                const nyAapning = val;
                const nyStenge = Math.max(stengeHour, nyAapning + 1);
                setBooking((b) => ({
                    ...b,
                    aapningstid: hourToTime(nyAapning),
                    stengetid: hourToTime(Math.min(23, nyStenge)),
                }));
            }}
            onChangeStengeHour={(val) => {
                const nyStenge = val;
                const nyAapning = Math.min(aapningHour, nyStenge - 1);
                setBooking((b) => ({
                    ...b,
                    aapningstid: hourToTime(Math.max(6, nyAapning)),
                    stengetid: hourToTime(nyStenge),
                }));
            }}
            onChangeMaksPerDag={(val) => setBooking((b) => ({ ...b, maksPerDag: val }))}
            onChangeMaksTotalt={(val) => setBooking((b) => ({ ...b, maksTotalt: val }))}
            onChangeDagerFremITid={(val) => setBooking((b) => ({ ...b, dagerFremITid: val }))}
            onChangeSlotLengdeMinutter={(val) =>
                setBooking((b) => ({ ...b, slotLengdeMinutter: parseInt(val, 10) }))
            }
            canSubmit={canSubmit}
            isSaving={oppdaterKlubb.isPending}
            onSubmit={submit}
        />
    );
}
