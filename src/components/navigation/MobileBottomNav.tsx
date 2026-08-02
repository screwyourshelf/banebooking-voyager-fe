import { LogIn, LogOut, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";

import {
  buildMobilePrimaryNavigation,
  buildMobileSecondaryNavigation,
  isNavigationItemCurrent,
  type AppNavigationSection,
} from "./navigationModel";

function MobileMenuSection({
  section,
  onNavigate,
}: {
  section: AppNavigationSection;
  onNavigate: () => void;
}) {
  const headingId = `mobile-menu-${section.id}`;
  const showHeading = section.id !== "personal";
  const { pathname } = useLocation();

  return (
    <section
      className="mobile-menu__section"
      aria-labelledby={showHeading ? headingId : undefined}
      aria-label={showHeading ? undefined : section.label}
    >
      {showHeading ? <h3 id={headingId}>{section.label}</h3> : null}
      <div className="mobile-menu__links">
        {section.items.map((item) => {
          const { id, to, label, icon: Icon, end, activePaths } = item;
          const content = (
            <>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </>
          );
          const sharedProps = {
            className: "mobile-menu__link",
            onClick: onNavigate,
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
      </div>
    </section>
  );
}

export default function MobileBottomNav() {
  const [open, setOpen] = useState(false);
  const { currentUser, signOut } = useAuth();
  const { bruker } = useBruker();
  const capabilities = bruker?.kapabiliteter ?? [];
  const primaryItems = buildMobilePrimaryNavigation(!!currentUser, capabilities);
  const sections = buildMobileSecondaryNavigation(!!currentUser, capabilities);

  if (!currentUser) {
    return (
      <nav className="mobile-bottom-nav" aria-label="Hovednavigasjon">
        {primaryItems.map(({ id, to, label, icon: Icon, end }) => (
          <NavLink key={id} to={to} end={end} className="mobile-bottom-nav__link">
            <Icon className="size-5" aria-hidden="true" />
            <span>{label === "Book bane" ? "Book" : label}</span>
          </NavLink>
        ))}

        <NavLink to="login" end className="mobile-bottom-nav__link">
          <LogIn className="size-5" aria-hidden="true" />
          <span>Logg inn</span>
        </NavLink>
      </nav>
    );
  }

  const drawerTitle = currentUser.name || "Din konto";
  const drawerDescription =
    currentUser.name && currentUser.email ? currentUser.email : "Konto og innstillinger";

  return (
    <Drawer direction="bottom" modal open={open} onOpenChange={setOpen}>
      <nav className="mobile-bottom-nav" aria-label="Hovednavigasjon">
        {primaryItems.map(({ id, to, label, icon: Icon, end }) => (
          <NavLink key={id} to={to} end={end} className="mobile-bottom-nav__link">
            <Icon className="size-5" aria-hidden="true" />
            <span>{label === "Book bane" ? "Book" : label}</span>
          </NavLink>
        ))}

        <DrawerTrigger asChild>
          <button
            type="button"
            className="mobile-bottom-nav__link mobile-bottom-nav__menu"
            data-active={open || undefined}
            aria-label="Åpne konto og meny"
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
            <span>Mer</span>
          </button>
        </DrawerTrigger>
      </nav>

      <DrawerContent className="mobile-menu" aria-describedby="mobile-menu-description">
        <DrawerHeader className="mobile-menu__header">
          <DrawerTitle>{drawerTitle}</DrawerTitle>
          <DrawerDescription id="mobile-menu-description">{drawerDescription}</DrawerDescription>
        </DrawerHeader>

        <div className="mobile-menu__scroll">
          <div className="mobile-menu__navigation">
            {sections.map((section) => (
              <MobileMenuSection
                key={section.id}
                section={section}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </div>
        </div>

        <DrawerFooter className="mobile-menu__footer">
          <Button
            variant="ghost"
            className="mobile-menu__utility"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
          >
            <LogOut aria-hidden="true" />
            <span>Logg ut</span>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
