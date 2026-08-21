import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/useTheme";

type ModeToggleProps = {
  presentation?: "icon" | "sidebar";
};

export default function ModeToggle({ presentation = "icon" }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";
  const actionLabel = isDark ? "Bruk lyst tema" : "Bruk mørkt tema";
  const handleToggle = () => setTheme(isDark ? "light" : "dark");

  if (presentation === "sidebar") {
    const Icon = isDark ? Sun : Moon;

    return (
      <SidebarMenuButton type="button" tooltip={actionLabel} onClick={handleToggle}>
        <Icon aria-hidden="true" />
        <span>{isDark ? "Lyst tema" : "Mørkt tema"}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleToggle}
      aria-label={actionLabel}
      title={actionLabel}
      data-ui="mode-toggle"
    >
      <Sun data-part="sun" />
      <Moon data-part="moon" />
    </Button>
  );
}
