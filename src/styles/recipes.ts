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
