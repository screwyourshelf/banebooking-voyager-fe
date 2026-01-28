import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.js";
import { ReactNode } from "react";

type TabItem = {
    value: string;
    label: string;
    content: ReactNode;
};

type SimpleTabsProps = {
    items: TabItem[];
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
};

export default function SimpleTabsLazy({
    items,
    value,
    onValueChange,
    className = "",
}: SimpleTabsProps) {
    const activeItem = items.find((item) => item.value === value) ?? items[0];

    return (
        <Tabs value={activeItem.value} onValueChange={onValueChange} className={className}>
            <TabsList className="flex w-full gap-2 overflow-x-auto whitespace-nowrap relative z-10">
                {items.map((item) => (
                    <TabsTrigger key={item.value} value={item.value} className="shrink-0">
                        {item.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            <div className="mt-3">{activeItem.content}</div>
        </Tabs>
    );
}
