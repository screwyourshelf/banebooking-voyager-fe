import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useKlubb } from "@/hooks/useKlubb";
import { mobileHeaderStyles } from "@/styles/recipes";
import { routePrefetchProps } from "@/utils/prefetchRoute";

import ModeToggle from "./ModeToggle";
import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";

export default function MobileAppHeader() {
  const { data: klubb } = useKlubb();

  return (
    <header className={mobileHeaderStyles.root}>
      <NavbarBrandMedKlubb
        klubbnavn={klubb?.navn ?? "Banebooking"}
        className={mobileHeaderStyles.brand}
        logoClassName={mobileHeaderStyles.logo}
      />
      <div className={mobileHeaderStyles.actions}>
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
