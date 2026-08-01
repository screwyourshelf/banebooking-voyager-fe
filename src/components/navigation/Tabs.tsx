import type { ReactNode } from "react";
import { Tabs as RadixTabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  className?: string;
  variant?: "default" | "section";
  ariaLabel?: string;

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
  variant = "default",
  ariaLabel,
}: TabsProps) {
  const first = items[0];
  if (!first) return null;

  const resolvedDefault = defaultValue ?? first.value;

  // Hvis value finnes men er ugyldig: la Radix håndtere default (ikke lås til ugyldig)
  const resolvedValue = value && items.some((i) => i.value === value) ? value : undefined;
  const isSection = variant === "section";

  return (
    <RadixTabs
      className={isSection ? "section-tabs" : undefined}
      value={resolvedValue}
      defaultValue={resolvedDefault}
      onValueChange={onValueChange}
    >
      <TabsList
        variant={isSection ? "line" : "default"}
        aria-label={ariaLabel}
        className={cn(
          isSection ? "section-tabs__list" : "flex h-auto flex-wrap gap-2 mb-2",
          className
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={isSection ? "section-tabs__trigger" : undefined}
          >
            {isSection && item.icon ? (
              <span className="section-tabs__icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent
          key={item.value}
          value={item.value}
          className={isSection ? "section-tabs__content" : "mt-0"}
        >
          {item.content}
        </TabsContent>
      ))}
    </RadixTabs>
  );
}

type TabsLazyMountProps = {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  variant?: "default" | "section";
  ariaLabel?: string;
};

export function TabsLazyMount({
  items,
  value,
  onValueChange,
  className = "",
  variant = "default",
  ariaLabel,
}: TabsLazyMountProps) {
  if (items.length === 0) return null;

  // Finn valgt tab, eller fallback til første hvis value er ugyldig
  const activeItem = items.find((item) => item.value === value) ?? items[0];
  const isSection = variant === "section";

  return (
    <RadixTabs
      className={isSection ? "section-tabs" : undefined}
      value={activeItem.value}
      onValueChange={onValueChange}
    >
      <TabsList
        variant={isSection ? "line" : "default"}
        aria-label={ariaLabel}
        className={cn(
          isSection ? "section-tabs__list" : "flex h-auto flex-wrap gap-2 mb-2",
          className
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={isSection ? "section-tabs__trigger" : undefined}
          >
            {isSection && item.icon ? (
              <span className="section-tabs__icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Render kun aktivt innhold */}
      <div className={isSection ? "section-tabs__content" : "mt-0"}>{activeItem.content}</div>
    </RadixTabs>
  );
}
