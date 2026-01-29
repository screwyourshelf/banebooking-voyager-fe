import { useMemo, useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import SettingsSection from "@/components/SettingsSection";
import SwitchRow from "@/components/SwitchRow";
import { formatDatoKort } from "@/utils/datoUtils.js";
import { useMineBookinger } from "@/hooks/useMineBookinger.js";
import { useBookingActions } from "@/hooks/useBookingActions.js";
import type { BookingSlot } from "@/types";
import BookingSlotItem from "@/components/Booking/BookingSlotItem.js";
import "animate.css";

type Props = { slug: string };

export default function MineBookingerTab({ slug }: Props) {
    const [visHistoriske, setVisHistoriske] = useState(false);
    const { data: bookinger = [], isLoading } = useMineBookinger(slug, visHistoriske);
    const { avbestillAsync, isPending } = useBookingActions(slug);

    const [openKey, setOpenKey] = useState<string | null>(null);

    const visteBookinger = useMemo(() => {
        return [...bookinger].sort((a, b) => {
            const datoDiff = new Date(b.dato).getTime() - new Date(a.dato).getTime();
            if (datoDiff !== 0) return datoDiff;
            return b.startTid.localeCompare(a.startTid);
        });
    }, [bookinger]);

    async function handleAvbestill(b: BookingSlot) {
        if (isPending) return;

        await avbestillAsync({
            baneId: b.baneId,
            dato: b.dato,
            startTid: b.startTid,
            sluttTid: b.sluttTid,
        });

        setOpenKey(null);
    }

    if (isLoading) return <LoaderSkeleton />;

    return (
        <div className="space-y-4">
            <SettingsSection
                title="Bookinger"
                description="Se kommende bookinger og velg om du vil inkludere tidligere."
            >
                <div className="space-y-3">
                    <SwitchRow
                        title="Vis også tidligere bookinger"
                        description="Inkluder bookinger som allerede er gjennomført."
                        checked={visHistoriske}
                        onCheckedChange={(v) => {
                            setVisHistoriske(v);
                            setOpenKey(null);
                        }}
                    />

                    {visteBookinger.length === 0 ? (
                        <div className="text-sm text-muted-foreground italic">
                            {visHistoriske
                                ? "Du har ingen registrerte bookinger."
                                : "Du har ingen kommende bookinger."}
                        </div>
                    ) : (
                        <div className={isPending ? "pointer-events-none opacity-60" : ""}>
                            {visteBookinger.map((b) => {
                                const key = `${b.baneId}-${b.dato}-${b.startTid}-${b.sluttTid}`;
                                const isOpen = openKey === key;

                                const harHandlinger = !!b.kanAvbestille;
                                const erInteraktiv = harHandlinger && !b.erPassert;

                                const harTemp = typeof b.temperatur === "number";
                                const harVind = typeof b.vind === "number";
                                const harVaerInfo = !!b.værSymbol || harTemp || harVind;

                                // dato + ikon + temp/vind (ikon rett etter dato)
                                const leftPrefix = harVaerInfo ? (
                                    <span className="flex items-center gap-1">
                                        <span>{formatDatoKort(b.dato)}</span>

                                        <span className="w-[18px] h-[18px] flex items-center justify-center">
                                            {b.værSymbol ? (
                                                <img
                                                    src={`${import.meta.env.BASE_URL}weather-symbols/svg/${b.værSymbol}.svg`}
                                                    alt={b.værSymbol}
                                                    width={18}
                                                    height={18}
                                                    className="select-none"
                                                    draggable={false}
                                                />
                                            ) : (
                                                <span className="invisible">.</span>
                                            )}
                                        </span>

                                        {(harTemp || harVind) ? (
                                            <span className="text-[11px] text-muted-foreground">
                                                {harTemp ? `${b.temperatur}°` : null}
                                                {harTemp && harVind ? " · " : null}
                                                {harVind ? `${b.vind} m/s` : null}
                                            </span>
                                        ) : null}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <span>{formatDatoKort(b.dato)}</span>
                                    </span>
                                );

                                return (
                                    <BookingSlotItem
                                        key={key}
                                        slot={b}
                                        currentUser={null} // MineBookinger skal aldri vise epost/ledig-logikk
                                        erInteraktivOverride={erInteraktiv}
                                        isOpen={isOpen}
                                        onToggle={() => {
                                            if (!erInteraktiv) return;
                                            setOpenKey((prev) => (prev === key ? null : key));
                                        }}
                                        onCancel={() => void handleAvbestill(b)}
                                        headerOverrideTitle={b.baneNavn}
                                        headerLeftPrefix={leftPrefix}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </SettingsSection>
        </div>
    );
}
