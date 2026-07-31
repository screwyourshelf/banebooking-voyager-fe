export type BookingActivityTheme = "tennis" | "padel" | "bordtennis" | "neutral";

const ACTIVITY_THEMES: Record<string, BookingActivityTheme> = {
  tennis: "tennis",
  padel: "padel",
  bordtennis: "bordtennis",
  "bord-tennis": "bordtennis",
  tabletennis: "bordtennis",
  "table-tennis": "bordtennis",
};

export function resolveBookingActivityTheme(slug?: string): BookingActivityTheme {
  if (!slug) return "neutral";

  return ACTIVITY_THEMES[slug.trim().toLowerCase()] ?? "neutral";
}
