import { useState } from "react";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table.js";
import { formatDatoKort } from "@/utils/datoUtils.js";
import { useMineBookinger } from "@/hooks/useMineBookinger.js";
import SettingsList from "@/components/SettingsList";
import SettingsRow from "@/components/SettingsRow";
import SettingsSection from "@/components/SettingsSection";
import { Switch } from "@/components/ui/switch";

type Props = {
    slug: string;
};

export default function MineBookingerTab({ slug }: Props) {
    const [visHistoriske, setVisHistoriske] = useState(false);

    const { data: bookinger = [], isLoading } = useMineBookinger(slug, visHistoriske);

    const visteBookinger = [...bookinger].sort((a, b) => {
        const datoDiff = new Date(b.dato).getTime() - new Date(a.dato).getTime();
        if (datoDiff !== 0) return datoDiff;
        return b.startTid.localeCompare(a.startTid);
    });

    if (isLoading) {
        return <LoaderSkeleton />;
    }

    return (
        <div className="space-y-4">
            <SettingsSection
                title="Bookinger"
                description="Se kommende bookinger og velg om du vil inkludere tidligere."
            >
                <div className="space-y-3">
                    {/* Filter */}
                    <SettingsList>
                        <SettingsRow
                            title="Vis også tidligere bookinger"
                            description="Inkluder bookinger som allerede er gjennomført."
                            right={<Switch checked={visHistoriske} onCheckedChange={setVisHistoriske} />}
                        />
                    </SettingsList>

                    {/* Resultat */}
                    {visteBookinger.length === 0 ? (
                        <div className="text-sm text-muted-foreground italic">
                            {visHistoriske
                                ? "Du har ingen registrerte bookinger."
                                : "Du har ingen kommende bookinger."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border bg-background">
                            <Table className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Dato</TableHead>
                                        <TableHead className="whitespace-nowrap">Tid</TableHead>
                                        <TableHead className="whitespace-nowrap">Bane</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visteBookinger.map((b, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="whitespace-nowrap">
                                                {formatDatoKort(b.dato)}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {b.startTid}–{b.sluttTid}
                                            </TableCell>
                                            <TableCell className="min-w-[10rem]">{b.baneNavn}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </SettingsSection>
        </div>
    );
}
