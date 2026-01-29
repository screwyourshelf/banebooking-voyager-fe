import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button.js";
import SettingsList from "@/components/SettingsList";
import SettingsRow from "@/components/SettingsRow";
import SettingsSection from "@/components/SettingsSection";
import InfoRow from "@/components/InfoRow";
import SlettMegDialog from "@/components/SlettMegDialog.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";

import { formatDatoKort } from "@/utils/datoUtils.js";
import { useMeg } from "@/hooks/useMeg.js";
import { useSlug } from "@/hooks/useSlug";

export default function PersondataTab() {
    const slug = useSlug();
    const { bruker, laster, lastNedEgenData, slettMeg } = useMeg();

    const [lasterNed, setLasterNed] = useState(false);

    if (laster || !bruker) {
        return <LoaderSkeleton />;
    }

    const vilkarStatus = bruker.vilkaarAkseptertDato
        ? `Akseptert ${formatDatoKort(bruker.vilkaarAkseptertDato)}${bruker.vilkaarVersjon ? ` (versjon ${bruker.vilkaarVersjon})` : ""
        }`
        : "Ikke registrert";

    const handleLastNed = async () => {
        if (lasterNed) return;

        try {
            setLasterNed(true);
            await lastNedEgenData();
        } catch (err: unknown) {
            // lastNedEgenData har allerede toast, men dette er en trygg fallback
            const message =
                err instanceof Error ? err.message : "Kunne ikke laste ned egen data";
            toast.error(message);
        } finally {
            setLasterNed(false);
        }
    };

    return (
        <div className="space-y-4">
            <SettingsSection
                title="Persondata"
                description="Her kan du se vilkår og laste ned egne data."
            >
                <SettingsList>
                    <InfoRow
                        label="Vilkår"
                        description="Vilkårene aksepteres automatisk ved første innlogging."
                        value={vilkarStatus}
                    />

                    <SettingsRow
                        title="Les vilkårene"
                        description="Åpnes i ny fane."
                        right={
                            <Link
                                to={`/${slug}/vilkaar`}
                                className="text-sm underline text-primary hover:text-primary/80"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Åpne
                            </Link>
                        }
                    />

                    <SettingsRow
                        title="Last ned dine data"
                        description="JSON med registrerte opplysninger og bookinger."
                        right={
                            <Button
                                onClick={handleLastNed}
                                size="sm"
                                variant="outline"
                                disabled={lasterNed || slettMeg.isPending}
                            >
                                {lasterNed ? "Laster..." : "Last ned"}
                            </Button>
                        }
                    />
                </SettingsList>
            </SettingsSection>

            <SettingsSection
                title="Slett bruker"
                description="Sletter bruker og all tilknyttet data permanent."
            >
                <SettingsList>
                    <SettingsRow
                        title=""
                        description="Dette kan ikke angres."
                        right={<SlettMegDialog slettMeg={slettMeg} />}
                    />
                </SettingsList>
            </SettingsSection>
        </div>
    );
}
