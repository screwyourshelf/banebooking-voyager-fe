import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import PageSection from "@/components/sections/PageSection";
import { FieldGroup, FieldList, FieldRow, InfoRow } from "@/components/fields";
import LoaderSkeleton from "@/components/LoaderSkeleton";
import SlettMegDialog from "@/components/SlettMegDialog";

import { formatDatoKort } from "@/utils/datoUtils";
import { useMeg } from "@/hooks/useMeg";
import { useSlug } from "@/hooks/useSlug";

export default function PersondataView() {
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
            const message = err instanceof Error ? err.message : "Kunne ikke laste ned egen data";
            toast.error(message);
        } finally {
            setLasterNed(false);
        }
    };

    return (
        <div className="space-y-4">
            <PageSection title="Persondata" description="Her kan du se vilkår og laste ned egne data.">
                <FieldGroup>
                    <FieldList>
                        <InfoRow
                            label="Vilkår"
                            description="Vilkårene aksepteres automatisk ved første innlogging."
                            value={vilkarStatus}
                        />

                        <FieldRow
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

                        <FieldRow
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
                    </FieldList>
                </FieldGroup>
            </PageSection>

            <PageSection title="Slett bruker" description="Sletter bruker og all tilknyttet data permanent.">
                <FieldList>
                    <FieldRow title="" description="Dette kan ikke angres." right={<SlettMegDialog slettMeg={slettMeg} />} />
                </FieldList>
            </PageSection>
        </div>
    );
}
