import { MoreHorizontal } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { routePrefetchProps } from "@/utils/prefetchRoute";

import { buildMobilePrimaryNavigation } from "./navigationModel";

export default function MobileBottomNav() {
  const { currentUser } = useAuth();
  const { bruker } = useBruker();
  const { openMobile, toggleSidebar } = useSidebar();
  const items = buildMobilePrimaryNavigation(Boolean(currentUser), bruker?.kapabiliteter ?? []);

  return (
    <nav className="mobile-bottom-nav" aria-label="Hovednavigasjon">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.end}
            className="mobile-bottom-nav__item"
            {...routePrefetchProps(item.to)}
          >
            {({ isActive }) => (
              <>
                <span
                  className="mobile-bottom-nav__indicator"
                  data-active={isActive || undefined}
                  aria-hidden="true"
                />
                <Icon className="mobile-bottom-nav__icon" aria-hidden="true" />
                <span className="mobile-bottom-nav__label">{item.mobileLabel ?? item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}

      <button
        type="button"
        className="mobile-bottom-nav__item"
        data-active={openMobile || undefined}
        aria-expanded={openMobile}
        aria-label="Åpne meny"
        onClick={toggleSidebar}
      >
        <span
          className="mobile-bottom-nav__indicator"
          data-active={openMobile || undefined}
          aria-hidden="true"
        />
        <MoreHorizontal className="mobile-bottom-nav__icon" aria-hidden="true" />
        <span>Mer</span>
      </button>
    </nav>
  );
}
