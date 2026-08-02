import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { useKlubb } from "@/hooks/useKlubb";

import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";
import {
  buildNavigationSections,
  isNavigationItemCurrent,
  type AppNavigationSection,
} from "./navigationModel";
import SidebarUtilities from "./SidebarUtilities";

function SidebarSection({ section }: { section: AppNavigationSection }) {
  const { pathname } = useLocation();

  return (
    <nav className="app-sidebar__section" aria-label={section.label}>
      <div className="app-sidebar__label">{section.label}</div>
      {section.items.map((item) => {
        const { id, to, label, icon: Icon, end, activePaths } = item;
        const content = (
          <>
            <Icon className="size-4.5" aria-hidden="true" />
            <span>{label}</span>
          </>
        );
        const sharedProps = {
          className: "app-sidebar__link",
          "aria-label": label,
          title: label,
        };

        return activePaths ? (
          <Link
            key={id}
            to={to}
            {...sharedProps}
            aria-current={isNavigationItemCurrent(item, pathname) ? "page" : undefined}
          >
            {content}
          </Link>
        ) : (
          <NavLink key={id} to={to} end={end} {...sharedProps}>
            {content}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AppSidebar() {
  const { data: klubb } = useKlubb();
  const { currentUser } = useAuth();
  const { bruker } = useBruker();
  const sections = buildNavigationSections(!!currentUser, bruker?.kapabiliteter ?? []);

  return (
    <div className="app-sidebar">
      <div className="app-sidebar__brand">
        <NavbarBrandMedKlubb
          klubbnavn={klubb?.navn ?? "\u00A0"}
          tone="inverted"
          className="text-lg"
        />
        <div className="app-sidebar__product">Banebooking</div>
      </div>

      <div className="app-sidebar__navigation">
        {sections.map((section) => (
          <SidebarSection key={section.id} section={section} />
        ))}
      </div>

      <SidebarUtilities />
    </div>
  );
}
