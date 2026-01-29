import { Button } from "@/components/ui/button.js";
import SettingsList from "@/components/SettingsList";
import SettingsRow from "@/components/SettingsRow";
import SettingsSection from "@/components/SettingsSection";
import InfoRow from "@/components/InfoRow";
import SlettMegDialog from "@/components/SlettMegDialog.js";
import { formatDatoKort } from "@/utils/datoUtils.js";
import { useMeg } from "@/hooks/useMeg.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import { Link } from "react-router-dom";

type Props = { slug: string };

export default function PersondataTab({ slug }: Props) {
    const { bruker, laster, lastNedEgenData, slettMeg } = useMeg(slug);
    const { isPending } = slettMeg;

    if (laster || !bruker) {
        return <LoaderSkeleton />;
    }

    const vilkarStatus = bruker.vilkaarAkseptertDato
        ? `Akseptert ${formatDatoKort(bruker.vilkaarAkseptertDato)}${bruker.vilkaarVersjon ? ` (versjon ${bruker.vilkaarVersjon})` : ""
        }`
        : "Ikke registrert";

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
                                onClick={lastNedEgenData}
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                            >
                                {isPending ? "Laster..." : "Last ned"}
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
