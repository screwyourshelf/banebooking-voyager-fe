import { useMemo, useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import SettingsSection from "@/components/SettingsSection";
import SwitchRow from "@/components/SwitchRow";
import { formatDatoKort } from "@/utils/datoUtils.js";
import { useMineBookinger } from "@/hooks/useMineBookinger.js";
import { useBookingActions } from "@/hooks/useBookingActions.js";
import type { BookingSlot } from "@/types";
import { FaChevronDown } from "react-icons/fa";
import "animate.css";

// juster sti
import { BookingActions } from "@/components/Booking/BookingActions.js";

type Props = {
    slug: string;
};

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
                            {visHistoriske ? "Du har ingen registrerte bookinger." : "Du har ingen kommende bookinger."}
                        </div>
                    ) : (
                        <div>
                            {visteBookinger.map((b) => {
                                const key = `${b.baneId}-${b.dato}-${b.startTid}-${b.sluttTid}`;
                                const isOpen = openKey === key;

                                // index-feel: kun interaktiv når det finnes handling og ikke passert
                                const harHandlinger = b.kanAvbestille; // vi har bare denne handlingen her
                                const erInteraktiv = harHandlinger && !b.erPassert;

                                const handleToggle = () => {
                                    if (!erInteraktiv) return;
                                    setOpenKey((prev) => (prev === key ? null : key));
                                };

                                return (
                                    <MineBookingItem
                                        key={key}
                                        slot={b}
                                        isOpen={isOpen}
                                        erInteraktiv={erInteraktiv}
                                        onToggle={handleToggle}
                                        onCancel={() => void handleAvbestill(b)}
                                        isPending={isPending}
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

function MineBookingItem({
    slot,
    isOpen,
    erInteraktiv,
    onToggle,
    onCancel,
    isPending,
}: {
    slot: BookingSlot;
    isOpen: boolean;
    erInteraktiv: boolean;
    onToggle: () => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    const tidKort = `${slot.startTid.slice(0, 2)}-${slot.sluttTid.slice(0, 2)}`;

    const harTemp = typeof slot.temperatur === "number";
    const harVind = typeof slot.vind === "number";
    const harVaerInfo = !!slot.værSymbol || harTemp || harVind;

    const className = [
        "border rounded shadow-sm p-2 mb-2",
        "transition-colors duration-300 ease-in-out",
        slot.erPassert ? "bg-gray-100 text-gray-400" : "",
        !slot.erPassert ? "bg-white text-gray-900" : "",
    ].join(" ");

    return (
        <div
            className={className}
            style={{
                cursor: erInteraktiv ? "pointer" : "default",
                opacity: slot.erPassert ? 0.5 : 1,
            }}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("button, input, label")) return;
                onToggle();
            }}
            role={erInteraktiv ? "button" : undefined}
            tabIndex={erInteraktiv ? 0 : undefined}
            onKeyDown={(e) => {
                if (!erInteraktiv) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle();
                }
            }}
        >
            {/* Header – samme layout-prinsipp som index */}
            <div className="flex items-center">
                <div className="flex flex-1 items-center justify-between min-w-0">
                    {/* Venstre: innhold (må være min-w-0 for å la bane truncate riktig) */}
                    <div className="flex items-center gap-2 min-w-0">
                        {/* Dato + vær */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <span>{formatDatoKort(slot.dato)}</span>

                            {harVaerInfo ? (
                                <span className="flex items-center gap-1">
                                    <span className="w-[18px] h-[18px] flex items-center justify-center">
                                        {slot.værSymbol ? (
                                            <img
                                                src={`${import.meta.env.BASE_URL}weather-symbols/svg/${slot.værSymbol}.svg`}
                                                alt={slot.værSymbol}
                                                width={14}
                                                height={14}
                                                className="select-none"
                                                draggable={false}
                                            />
                                        ) : (
                                            <span className="invisible">.</span>
                                        )}
                                    </span>

                                    {(harTemp || harVind) ? (
                                        <span className="text-[11px] text-muted-foreground">
                                            
                                            {harTemp ? `${slot.temperatur}°` : null}
                                            {harTemp && harVind ? " / " : null}
                                            {harVind ? `${slot.vind} m/s` : null}
                                            
                                        </span>
                                    ) : null}
                                </span>
                            ) : null}
                        </div>

                        {/* Tid */}
                        <div className="whitespace-nowrap font-semibold text-sm text-right">
                            {tidKort}
                        </div>

                        {/* Bane (truncates innenfor) */}
                        <div className="min-w-0 text-sm whitespace-nowrap truncate" title={slot.baneNavn}>
                            {slot.baneNavn}
                        </div>
                    </div>

                    {/* Høyre: chevron (shrink-0 så den aldri havner utenfor) */}
                    {erInteraktiv ? (
                        <div className="p-1 shrink-0">
                            <FaChevronDown
                                size={12}
                                style={{
                                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s",
                                }}
                                aria-hidden="true"
                            />
                        </div>
                    ) : (
                        <div className="p-1 shrink-0" />
                    )}
                </div>
            </div>

            {/* Expanded – som index */}
            {isOpen && !slot.erPassert && (
                <div className="mt-1">
                    <div className="bg-inherit flex justify-end">
                        <div className={isPending ? "pointer-events-none opacity-60" : ""}>
                            <BookingActions
                                slot={slot}
                                onCancel={() => onCancel()}
                                reset={() => {
                                    /* no-op */
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}