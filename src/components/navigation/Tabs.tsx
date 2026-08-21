import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs as RadixTabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  controls?: ReactNode;

  /** Controlled */
  value?: string;
  onValueChange?: (value: string) => void;

  /** Uncontrolled */
  defaultValue?: string;
};

export default function Tabs({
  items,
  className,
  value,
  onValueChange,
  defaultValue,
  variant = "default",
  ariaLabel,
  controls,
}: TabsProps) {
  const first = items[0];
  if (!first) return null;

  const resolvedDefault = defaultValue ?? first.value;

  // Hvis value finnes men er ugyldig: la Radix håndtere default (ikke lås til ugyldig)
  const resolvedValue = value && items.some((i) => i.value === value) ? value : undefined;
  return (
    <RadixTabs
      data-ui="tabs"
      data-variant={variant}
      value={resolvedValue}
      defaultValue={resolvedDefault}
      onValueChange={onValueChange}
    >
      <TabsList
        variant={variant === "section" ? "line" : "default"}
        aria-label={ariaLabel}
        className={className}
      >
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {variant === "section" && item.icon ? (
              <span data-part="icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {controls}

      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
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
  controls?: ReactNode;
};

export function TabsLazyMount({
  items,
  value,
  onValueChange,
  className,
  variant = "default",
  ariaLabel,
  controls,
}: TabsLazyMountProps) {
  if (items.length === 0) return null;

  // Finn valgt tab, eller fallback til første hvis value er ugyldig
  const activeItem = items.find((item) => item.value === value) ?? items[0];
  return (
    <RadixTabs
      data-ui="tabs"
      data-variant={variant}
      value={activeItem.value}
      onValueChange={onValueChange}
    >
      <TabsList
        variant={variant === "section" ? "line" : "default"}
        aria-label={ariaLabel}
        className={className}
      >
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {variant === "section" && item.icon ? (
              <span data-part="icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {controls}

      {/* Render kun aktivt innhold */}
      <div data-part="content">{activeItem.content}</div>
    </RadixTabs>
  );
}

export type RouteTabItem = {
  value: string;
  label: string;
  to: string;
};

type RouteTabsProps = {
  items: RouteTabItem[];
  value: string;
  ariaLabel: string;
  children: ReactNode;
};

export function RouteTabs({ items, value, ariaLabel, children }: RouteTabsProps) {
  const navigate = useNavigate();
  const hasActiveItem = items.some((item) => item.value === value);

  if (items.length === 0 || !hasActiveItem) return children;

  const handleValueChange = (nextValue: string) => {
    const nextItem = items.find((item) => item.value === nextValue);
    if (!nextItem || nextValue === value) return;

    void navigate(nextItem.to, { relative: "path" });
  };

  return (
    <RadixTabs
      data-ui="tabs"
      data-variant="section"
      value={value}
      onValueChange={handleValueChange}
    >
      <div data-part="rail">
        <TabsList variant="line" aria-label={ariaLabel} data-count={items.length}>
          {items.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value={value}>{children}</TabsContent>
    </RadixTabs>
  );
}
