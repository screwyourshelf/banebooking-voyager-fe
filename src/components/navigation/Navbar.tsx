import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useKlubb } from "@/hooks/useKlubb";
import { routePrefetchProps } from "@/utils/prefetchRoute";

import ModeToggle from "./ModeToggle";
import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";

export default function Navbar() {
  const { data: klubb } = useKlubb();

  return (
    <div className="app-topbar">
      <NavbarBrandMedKlubb klubbnavn={klubb?.navn ?? "\u00A0"} className="md:hidden" />

      <div className="app-topbar__actions">
        <span className="app-topbar__theme">
          <ModeToggle />
        </span>

        <Button asChild variant="ghost" size="icon">
          <Link to="nyheter" aria-label="Nyheter" {...routePrefetchProps("nyheter")}>
            <Newspaper className="size-[var(--app-topbar-action-icon-size)]" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
