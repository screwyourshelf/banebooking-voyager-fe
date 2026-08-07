import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

type ModeToggleProps = {
  presentation?: "icon" | "sidebar";
};

export default function ModeToggle({ presentation: _presentation = "icon" }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";
  const actionLabel = isDark ? "Bruk lyst tema" : "Bruk mørkt tema";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <Sun className="rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
