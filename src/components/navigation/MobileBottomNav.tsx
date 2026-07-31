import { LogIn, LogOut, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

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

import LoginPanel from "./LoginPanel";
import {
  buildMobilePrimaryNavigation,
  buildMobileSecondaryNavigation,
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

  return (
    <section
      className="mobile-menu__section"
      aria-labelledby={showHeading ? headingId : undefined}
      aria-label={showHeading ? undefined : section.label}
    >
      {showHeading ? <h3 id={headingId}>{section.label}</h3> : null}
      <div className="mobile-menu__links">
        {section.items.map(({ id, to, label, icon: Icon, end }) => (
          <NavLink key={id} to={to} end={end} className="mobile-menu__link" onClick={onNavigate}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
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
  const drawerTitle = currentUser ? currentUser.name || "Din konto" : "Logg inn";
  const drawerDescription = currentUser
    ? currentUser.name && currentUser.email
      ? currentUser.email
      : "Konto og innstillinger"
    : "Bestill bane og se reservasjonene dine.";

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
            aria-label={currentUser ? "Åpne konto og meny" : "Åpne innlogging"}
          >
            {currentUser ? (
              <MoreHorizontal className="size-5" aria-hidden="true" />
            ) : (
              <LogIn className="size-5" aria-hidden="true" />
            )}
            <span>{currentUser ? "Mer" : "Logg inn"}</span>
          </button>
        </DrawerTrigger>
      </nav>

      <DrawerContent className="mobile-menu" aria-describedby="mobile-menu-description">
        <DrawerHeader className="mobile-menu__header">
          <DrawerTitle>{drawerTitle}</DrawerTitle>
          <DrawerDescription id="mobile-menu-description">{drawerDescription}</DrawerDescription>
        </DrawerHeader>

        <div className="mobile-menu__scroll">
          {currentUser ? (
            <div className="mobile-menu__navigation">
              {sections.map((section) => (
                <MobileMenuSection
                  key={section.id}
                  section={section}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          ) : (
            <LoginPanel showIntro={false} onLoginSuccess={() => setOpen(false)} />
          )}
        </div>

        {currentUser ? (
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
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
