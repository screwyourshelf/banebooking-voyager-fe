import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function TabsLazyMount({
  items,
  value,
  onValueChange,
  className = "",
}: SimpleTabsProps) {
  // Finn valgt tab, eller fallback til første hvis value er ugyldig
  const activeItem = items.find((item) => item.value === value) ?? items[0];

  return (
    <Tabs value={activeItem.value} onValueChange={onValueChange}>
      <TabsList className={`flex flex-wrap gap-2 mb-2 ${className}`}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Render kun aktivt innhold */}
      <div className="mt-0">{activeItem.content}</div>
    </Tabs>
  );
}
