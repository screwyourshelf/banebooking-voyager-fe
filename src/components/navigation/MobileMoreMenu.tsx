import { LogIn, LogOut } from "lucide-react";
import { Link, useLocation, useMatch, useResolvedPath } from "react-router-dom";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { routePrefetchProps } from "@/utils/prefetchRoute";

import {
  buildMobileSecondaryNavigation,
  isNavigationItemCurrent,
  type AppNavigationItem,
  type AppNavigationSection,
} from "./navigationModel";

function MobileMenuItem({ item }: { item: AppNavigationItem }) {
  const location = useLocation();
  const resolved = useResolvedPath(item.to);
  const routeMatch = useMatch({ path: resolved.pathname, end: item.end ?? false });
  const isActive = item.activePaths
    ? isNavigationItemCurrent(item, location.pathname)
    : Boolean(routeMatch);
  const Icon = item.icon;

  return (
    <li>
      <SheetClose asChild>
        <Link
          to={item.to}
          className="mobile-more-menu__link"
          aria-current={isActive ? "page" : undefined}
          {...routePrefetchProps(item.to)}
        >
          <Icon className="mobile-more-menu__icon" aria-hidden="true" />
          <span>{item.label}</span>
        </Link>
      </SheetClose>
    </li>
  );
}

function MobileMenuSection({ section }: { section: AppNavigationSection }) {
  return (
    <section className="mobile-more-menu__section" aria-labelledby={`mobile-menu-${section.id}`}>
      <h2 id={`mobile-menu-${section.id}`} className="mobile-more-menu__section-title">
        {section.label}
      </h2>
      <ul className="mobile-more-menu__list">
        {section.items.map((item) => (
          <MobileMenuItem key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

type MobileMoreMenuProps = {
  children: React.ReactNode;
};

export default function MobileMoreMenu({ children }: MobileMoreMenuProps) {
  const { currentUser, signOut } = useAuth();
  const { bruker } = useBruker();
  const sections = buildMobileSecondaryNavigation(
    Boolean(currentUser),
    bruker?.kapabiliteter ?? []
  );
  const accountLabel = currentUser?.name || currentUser?.email || "Meny";

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mobile-more-menu"
        aria-label="Mer"
      >
        <div className="mobile-more-menu__handle" aria-hidden="true" />
        <SheetHeader className="mobile-more-menu__header">
          <SheetTitle className="mobile-more-menu__account-name">{accountLabel}</SheetTitle>
          <SheetDescription className="mobile-more-menu__account-email">
            {currentUser?.email ?? "Logg inn for å se kontoen din"}
          </SheetDescription>
        </SheetHeader>

        <div className="mobile-more-menu__content">
          {sections.map((section) => (
            <MobileMenuSection key={section.id} section={section} />
          ))}
        </div>

        <SheetFooter className="mobile-more-menu__footer">
          {currentUser ? (
            <SheetClose asChild>
              <button
                type="button"
                className="mobile-more-menu__session-action"
                onClick={() => void signOut()}
              >
                <LogOut aria-hidden="true" />
                Logg ut
              </button>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Link
                to="login"
                className="mobile-more-menu__session-action"
                {...routePrefetchProps("login")}
              >
                <LogIn aria-hidden="true" />
                Logg inn
              </Link>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
