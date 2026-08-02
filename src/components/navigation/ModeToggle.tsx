import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

type ModeToggleProps = {
  presentation?: "icon" | "sidebar";
};

export default function ModeToggle({ presentation = "icon" }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";
  const actionLabel = isDark ? "Bruk lyst tema" : "Bruk mørkt tema";

  if (presentation === "sidebar") {
    return (
      <button
        type="button"
        className="app-sidebar__utility"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={actionLabel}
        title={actionLabel}
      >
        <span className="app-sidebar__utility-icon" aria-hidden="true">
          <Sun className="rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
          <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </span>
        <span className="app-sidebar__utility-copy">
          <strong>{isDark ? "Lyst tema" : "Mørkt tema"}</strong>
          <small>Bytt utseende</small>
        </span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <Sun className="size-[var(--app-topbar-action-icon-size)] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
      <Moon className="absolute size-[var(--app-topbar-action-icon-size)] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
