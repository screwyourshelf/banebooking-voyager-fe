import { MoreHorizontal } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { mobileNavigationStyles } from "@/styles/recipes";
import { routePrefetchProps } from "@/utils/prefetchRoute";

import { buildMobilePrimaryNavigation } from "./navigationModel";

export default function MobileBottomNav() {
  const { currentUser } = useAuth();
  const { bruker } = useBruker();
  const { openMobile, toggleSidebar } = useSidebar();
  const items = buildMobilePrimaryNavigation(Boolean(currentUser), bruker?.kapabiliteter ?? []);

  return (
    <nav className={mobileNavigationStyles.root} aria-label="Hovednavigasjon">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.end}
            className={mobileNavigationStyles.item}
            {...routePrefetchProps(item.to)}
          >
            {({ isActive }) => (
              <>
                <span
                  className={mobileNavigationStyles.indicator}
                  data-active={isActive || undefined}
                  aria-hidden="true"
                />
                <Icon className={mobileNavigationStyles.icon} aria-hidden="true" />
                <span className="truncate">{item.mobileLabel ?? item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}

      <button
        type="button"
        className={mobileNavigationStyles.item}
        data-active={openMobile || undefined}
        aria-expanded={openMobile}
        aria-label="Åpne meny"
        onClick={toggleSidebar}
      >
        <span
          className={mobileNavigationStyles.indicator}
          data-active={openMobile || undefined}
          aria-hidden="true"
        />
        <MoreHorizontal className={mobileNavigationStyles.icon} aria-hidden="true" />
        <span>Mer</span>
      </button>
    </nav>
  );
}
