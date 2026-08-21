import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useKlubb } from "@/hooks/useKlubb";
import { routePrefetchProps } from "@/utils/prefetchRoute";

import ModeToggle from "./ModeToggle";
import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";

export default function MobileAppHeader() {
  const { data: klubb } = useKlubb();

  return (
    <header className="app-topbar">
      <NavbarBrandMedKlubb klubbnavn={klubb?.navn ?? "Banebooking"} placement="topbar" />
      <div className="app-topbar__actions">
        <ModeToggle />
        <Button asChild variant="ghost" size="icon-sm">
          <Link to="nyheter" aria-label="Nyheter" {...routePrefetchProps("nyheter")}>
            <Newspaper />
          </Link>
        </Button>
      </div>
    </header>
  );
}
