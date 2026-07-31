import { NavLink } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { useKlubb } from "@/hooks/useKlubb";

import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";
import { buildNavigationSections, type AppNavigationSection } from "./navigationModel";

function SidebarSection({ section }: { section: AppNavigationSection }) {
  return (
    <nav className="app-sidebar__section" aria-label={section.label}>
      <div className="app-sidebar__label">{section.label}</div>
      {section.items.map(({ id, to, label, icon: Icon, end }) => (
        <NavLink
          key={id}
          to={to}
          end={end}
          className="app-sidebar__link"
          aria-label={label}
          title={label}
        >
          <Icon className="size-4.5" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
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

      {sections.map((section) => (
        <SidebarSection key={section.id} section={section} />
      ))}
    </div>
  );
}
