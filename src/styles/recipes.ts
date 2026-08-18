/**
 * Shared Tailwind recipes for product-level composition.
 *
 * Keep replaceable shadcn primitives in `components/ui` untouched. Repeated
 * product styling belongs here so pages do not drift through copied class lists.
 */
export const mobileHeaderStyles = {
  root: "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:hidden",
  brand: "min-w-0 flex-1 text-base font-semibold",
  logo: "size-10 rounded-xl",
  actions: "flex shrink-0 items-center gap-1",
} as const;

export const mobileNavigationStyles = {
  root: "fixed inset-x-0 bottom-0 z-40 grid min-h-[calc(4.25rem+env(safe-area-inset-bottom))] grid-flow-col auto-cols-fr border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(0_0_0/0.06)] backdrop-blur md:hidden",
  item: "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset aria-[current=page]:text-primary data-[active=true]:text-primary",
  indicator:
    "absolute inset-x-3 top-0 h-0.5 rounded-b-full bg-transparent data-[active=true]:bg-primary",
  icon: "size-5",
} as const;
