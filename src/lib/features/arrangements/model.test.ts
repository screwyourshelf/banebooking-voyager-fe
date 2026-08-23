import { describe, expect, it } from "vitest";
import { createArrangement } from "./arrangement-test-data";
import {
  createArrangementListItem,
  filterArrangementsByBranch,
  sortArrangements,
  visibleCountForSelectedArrangement,
} from "./model";

const referenceDate = new Date(2026, 7, 23);

describe("arrangement list model", () => {
  it("sorterer kommende stigende og historiske synkende", () => {
    const sorted = sortArrangements([
      createArrangement({ id: "past-old", erPassert: true, startDato: "2026-01-01" }),
      createArrangement({ id: "future-late", startDato: "2026-09-01" }),
      createArrangement({ id: "past-new", erPassert: true, startDato: "2026-07-01" }),
      createArrangement({ id: "future-first", startDato: "2026-08-25" }),
    ]);

    expect(sorted.map((arrangement) => arrangement.id)).toEqual([
      "future-first",
      "future-late",
      "past-new",
      "past-old",
    ]);
  });

  it("bygger dato, status, program og backendstyrt avlysningshandling", () => {
    const item = createArrangementListItem(createArrangement(), referenceDate);

    expect(item.dateRange.label).toBe("25. aug.–27. aug.");
    expect(item.lifecycle).toEqual({ label: "Kommende", tone: "event" });
    expect(item.relativeStart).toBe("Starter om 2 dager");
    expect(item.programSummary).toBe("1 tid · 1 dag · 10:00–11:00");
    expect(item.canCancel).toBe(true);
  });

  it("filtrerer på gren og gjør en URL-valgt rad synlig forbi første side", () => {
    const arrangements = Array.from({ length: 12 }, (_, index) =>
      createArrangement({
        id: `event-${index + 1}`,
        grenNavn: index % 2 === 0 ? "Tennis" : "Padel",
      })
    );
    const filtered = filterArrangementsByBranch(arrangements, ["Padel"]);

    expect(filtered).toHaveLength(6);
    expect(visibleCountForSelectedArrangement(arrangements, "event-12", 10)).toBe(12);
  });
});
