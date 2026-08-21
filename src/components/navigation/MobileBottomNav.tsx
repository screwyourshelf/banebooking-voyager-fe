import { MoreHorizontal } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { routePrefetchProps } from "@/utils/prefetchRoute";

import MobileMoreMenu from "./MobileMoreMenu";
import { buildMobilePrimaryNavigation } from "./navigationModel";

export default function MobileBottomNav() {
  const { currentUser } = useAuth();
  const { bruker } = useBruker();
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

      <MobileMoreMenu>
        <button type="button" className="mobile-bottom-nav__item" aria-label="Åpne meny">
          <span className="mobile-bottom-nav__indicator" aria-hidden="true" />
          <MoreHorizontal className="mobile-bottom-nav__icon" aria-hidden="true" />
          <span>Mer</span>
        </button>
      </MobileMoreMenu>
    </nav>
  );
}
