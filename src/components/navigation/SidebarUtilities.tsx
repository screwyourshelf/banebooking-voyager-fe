import { CircleUser, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useBruker } from "@/hooks/useBruker";
import { formaterRolle } from "@/utils/brukerPresentation";
import { prefetchRoute } from "@/utils/prefetchRoute";

import ModeToggle from "./ModeToggle";

function prefetch(path: string) {
  return {
    onMouseEnter: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  };
}

export default function SidebarUtilities() {
  const { currentUser, signOut } = useAuth();
  const { bruker } = useBruker();

  const accountLabel = currentUser?.name || currentUser?.email || "Din konto";
  const roleLabel = bruker?.roller.length
    ? bruker.roller.map(formaterRolle).join(", ")
    : "Innlogget";

  return (
    <div className="app-sidebar__footer">
      <ModeToggle presentation="sidebar" />

      {currentUser ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="app-sidebar__utility"
              aria-label="Åpne kontomeny"
              title={accountLabel}
            >
              <span className="app-sidebar__utility-icon" aria-hidden="true">
                <CircleUser />
              </span>
              <span className="app-sidebar__utility-copy">
                <strong>{accountLabel}</strong>
                <small>{roleLabel}</small>
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={8}
            className="sidebar-account-menu"
          >
            <div className="account-menu__identity">
              <span>Innlogget som</span>
              <strong>{accountLabel}</strong>
              {currentUser.email ? <small>{currentUser.email}</small> : null}
            </div>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="minside" {...prefetch("minside")}>
                <CircleUser className="mr-2 size-4" />
                Min side
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => void signOut()}>
              <LogOut className="mr-2 size-4" />
              Logg ut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          to="login"
          className="app-sidebar__utility"
          aria-label="Logg inn"
          title="Logg inn"
          {...prefetch("login")}
        >
          <span className="app-sidebar__utility-icon" aria-hidden="true">
            <LogIn />
          </span>
          <span className="app-sidebar__utility-copy">
            <strong>Logg inn</strong>
            <small>Til din konto</small>
          </span>
        </Link>
      )}
    </div>
  );
}
