/**
 * Shared Tailwind recipes for product-level composition.
 *
 * Keep replaceable shadcn primitives in `components/ui` untouched. Repeated
 * product styling belongs here so pages do not drift through copied class lists.
 */
export const brandedPageStyles = {
  frame: "mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 md:py-8 lg:px-8 lg:py-10",
  badge: "border-transparent bg-sidebar-accent text-sidebar-accent-foreground",
  title: "font-heading text-page-title text-balance text-sidebar-foreground",
  description: "max-w-2xl text-body text-sidebar-foreground/75 md:text-lead",
} as const;

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

export const bookingPageStyles = {
  frame:
    "mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-6 sm:px-6 md:gap-6 md:py-8 lg:px-8 lg:py-10",
  hero: "-mx-4 space-y-2 bg-background px-4 py-5 sm:-mx-6 sm:px-6 md:mx-0 md:bg-transparent md:p-0",
  heroBadge:
    "border-transparent bg-accent text-accent-foreground md:border-white/25 md:bg-white/10 md:text-white",
  heroTitle: "font-heading text-page-title text-balance text-foreground md:text-white",
  heroDescription: "max-w-2xl text-body text-muted-foreground md:text-lead md:text-white/75",
  workspace: "overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-foreground/10 md:shadow-xl",
  selectorCard:
    "gap-0 rounded-none bg-sidebar py-0 text-sidebar-foreground ring-0 [--card-spacing:--spacing(5)]",
  selectorHeader: "grid-cols-[1fr_auto] items-center gap-3 border-b border-white/15 py-4",
  selectorTitle: "text-lg font-semibold text-sidebar-foreground",
  selectorRules: "text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground",
  selectorGrid:
    "grid gap-5 py-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end",
  selectorField: "min-w-0",
  selectorLabel: "text-sm font-semibold text-sidebar-foreground/80",
  selectorGroup: "min-w-0 w-full flex-wrap justify-start gap-2",
  selectorItem:
    "border-white/20 bg-white/10 text-sidebar-foreground hover:bg-white/15 hover:text-sidebar-foreground data-[state=on]:border-white/35 data-[state=on]:bg-white/15 data-[state=on]:text-sidebar-foreground data-[state=on]:shadow-[inset_0_-2px_0_var(--aas-orange-500)]",
  selectorDate:
    "border-white/20 bg-white/10 text-sidebar-foreground hover:bg-white/15 hover:text-sidebar-foreground",
  resultsCard: "gap-0 rounded-none py-0 ring-0",
  resultsHeader: "border-b py-4",
  resultsTitle: "text-lg font-semibold tracking-tight",
  resultsContent: "py-4",
} as const;

export const binaryChoiceStyles = {
  group: "w-full sm:w-auto",
  item: "flex-1 sm:flex-none",
} as const;

export const arrangementEditorStyles = {
  sheet: "w-full! overflow-y-auto p-0 sm:max-w-3xl! lg:max-w-5xl!",
  sheetHeader:
    "sticky top-0 z-10 gap-3 border-b bg-sidebar px-4 py-5 text-sidebar-foreground sm:px-6",
  sheetBackButton:
    "w-fit text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  sheetBadge: "bg-sidebar-accent text-sidebar-accent-foreground",
  sheetTitle: "text-2xl text-sidebar-foreground sm:text-3xl",
  sheetDescription: "text-sidebar-foreground/70",
  sheetBody: "p-4 sm:p-6",
  tabs: "gap-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10",
  tabsList: "h-12 w-full justify-start gap-6",
  tabsTrigger:
    "flex-none rounded-none border-0 px-0 after:bg-ring focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none",
  section: "px-4 py-6 sm:px-6",
  sectionIntro: "mb-5 space-y-1",
  fieldRow: "grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-center",
  fieldRowTop: "grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-start",
} as const;
