import { ReactNode } from "react";
import { Tabs as RadixTabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  className?: string;

  /** Controlled */
  value?: string;
  onValueChange?: (value: string) => void;

  /** Uncontrolled */
  defaultValue?: string;
};

export default function Tabs({
  items,
  className = "",
  value,
  onValueChange,
  defaultValue,
}: TabsProps) {
  const first = items[0];
  if (!first) return null;

  const resolvedDefault = defaultValue ?? first.value;

  // Hvis value finnes men er ugyldig: la Radix håndtere default (ikke lås til ugyldig)
  const resolvedValue = value && items.some((i) => i.value === value) ? value : undefined;

  return (
    <RadixTabs value={resolvedValue} defaultValue={resolvedDefault} onValueChange={onValueChange}>
      <TabsList className={`flex flex-wrap gap-2 mb-2 ${className}`}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} className="mt-0">
          {item.content}
        </TabsContent>
      ))}
    </RadixTabs>
  );
}
