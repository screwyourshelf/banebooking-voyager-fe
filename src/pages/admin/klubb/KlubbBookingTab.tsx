import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import SettingsSection from "@/components/SettingsSection";
import SettingsList from "@/components/SettingsList";
import SettingsRow from "@/components/SettingsRow";
import SettingsRange from "@/components/SettingsRange";
import { useKlubb } from "@/hooks/useKlubb";
import SettingsSelectRow from "@/components/SettingsSelectRow";

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

export default function KlubbBookingTab() {
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

        // NB: ikke bruk { ...booking, ...klubb.bookingRegel } her (stale closure).
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

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();

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
            }}
        >
            <SettingsSection
                title="Bookinginnstillinger"
                description="Styr åpningstider, hvor mange bookinger som er lov, og hvor langt frem man kan booke."
            >
                <SettingsList>
                    <SettingsRow
                        title="Åpningstid"
                        description="Tidligste time det går an å booke."
                        right={<div className="text-sm font-medium tabular-nums">{aapningHour}</div>}
                    >
                        <SettingsRange
                            id="aapningstid"
                            value={aapningHour}
                            min={6}
                            max={23}
                            onChange={(val) => {
                                const nyAapning = val;
                                const nyStenge = Math.max(stengeHour, nyAapning + 1);
                                setBooking((b) => ({
                                    ...b,
                                    aapningstid: hourToTime(nyAapning),
                                    stengetid: hourToTime(Math.min(23, nyStenge)),
                                }));
                            }}
                        />
                    </SettingsRow>

                    <SettingsRow
                        title="Stengetid"
                        description="Siste time som kan startes."
                        right={<div className="text-sm font-medium tabular-nums">{stengeHour}</div>}
                    >
                        <SettingsRange
                            id="stengetid"
                            value={stengeHour}
                            min={6}
                            max={23}
                            onChange={(val) => {
                                const nyStenge = val;
                                const nyAapning = Math.min(aapningHour, nyStenge - 1);
                                setBooking((b) => ({
                                    ...b,
                                    aapningstid: hourToTime(Math.max(6, nyAapning)),
                                    stengetid: hourToTime(nyStenge),
                                }));
                            }}
                        />
                    </SettingsRow>

                    <SettingsRow
                        title="Maks bookinger per dag"
                        description="Begrenser hvor mange bookinger én bruker kan ha på samme dag."
                        right={
                            <div className="text-sm font-medium tabular-nums">{booking.maksPerDag}</div>
                        }
                    >
                        <SettingsRange
                            id="maksPerDag"
                            value={booking.maksPerDag}
                            min={0}
                            max={5}
                            onChange={(val) => setBooking((b) => ({ ...b, maksPerDag: val }))}
                        />
                    </SettingsRow>

                    <SettingsRow
                        title="Maks aktive bookinger totalt"
                        description="Begrenser hvor mange aktive bookinger en bruker kan ha samtidig."
                        right={
                            <div className="text-sm font-medium tabular-nums">{booking.maksTotalt}</div>
                        }
                    >
                        <SettingsRange
                            id="maksTotalt"
                            value={booking.maksTotalt}
                            min={0}
                            max={10}
                            onChange={(val) => setBooking((b) => ({ ...b, maksTotalt: val }))}
                        />
                    </SettingsRow>

                    <SettingsRow
                        title="Dager frem i tid"
                        description="Hvor mange dager frem i tid det er mulig å booke."
                        right={
                            <div className="text-sm font-medium tabular-nums">{booking.dagerFremITid}</div>
                        }
                    >
                        <SettingsRange
                            id="dagerFremITid"
                            value={booking.dagerFremITid}
                            min={1}
                            max={14}
                            onChange={(val) => setBooking((b) => ({ ...b, dagerFremITid: val }))}
                        />
                    </SettingsRow>

                    <SettingsSelectRow
                        title="Slot-lengde"
                        description="Hvor lange booking-slottene er (låst i denne versjonen)."
                        id="slotLengdeMinutter"
                        value={booking.slotLengdeMinutter.toString()}
                        onChange={(val) =>
                            setBooking((b) => ({ ...b, slotLengdeMinutter: parseInt(val, 10) }))
                        }
                        options={[
                            { label: "30 minutter", value: "30" },
                            { label: "45 minutter", value: "45" },
                            { label: "60 minutter", value: "60" },
                            { label: "90 minutter", value: "90" },
                        ]}
                        disabled
                    />

                </SettingsList>
            </SettingsSection>

            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!canSubmit || oppdaterKlubb.isPending}>
                    {oppdaterKlubb.isPending ? "Lagrer..." : "Lagre endringer"}
                </Button>
            </div>
        </form>
    );
}
