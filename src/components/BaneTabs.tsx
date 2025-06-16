import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.js";
import type { Bane } from "../types/index.js";

type Props = {
    baner: Bane[];
    valgtBaneId: string;
    onVelgBane: (id: string) => void;
};

export default function BaneTabs({ baner, valgtBaneId, onVelgBane }: Props) {
    return (
        <Tabs value={valgtBaneId} onValueChange={onVelgBane}>
            <TabsList className="flex flex-wrap gap-2 mb-2">
                {baner.map((bane) => (
                    <TabsTrigger key={bane.id} value={bane.id}>
                        {bane.navn}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
