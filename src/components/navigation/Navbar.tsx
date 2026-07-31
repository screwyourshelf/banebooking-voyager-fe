import { CircleUser, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotifikasjonDrawer } from "@/features/feed/components";
import { useAuth } from "@/hooks/useAuth";
import { useKlubb } from "@/hooks/useKlubb";
import { prefetchRoute } from "@/utils/prefetchRoute";

import LoginPanel from "./LoginPanel";
import ModeToggle from "./ModeToggle";
import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";

function prefetch(path: string) {
  return {
    onMouseEnter: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  };
}

export default function Navbar() {
  const { data: klubb } = useKlubb();
  const { currentUser, signOut } = useAuth();
  const accountLabel = currentUser?.name || currentUser?.email;

  return (
    <div className="app-topbar">
      <NavbarBrandMedKlubb klubbnavn={klubb?.navn ?? "\u00A0"} className="md:hidden" />

      <div className="app-topbar__actions">
        <span className="app-topbar__theme">
          <ModeToggle />
        </span>

        <NotifikasjonDrawer />

        <div className="app-topbar__account">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                aria-label={currentUser ? "Åpne kontomeny" : "Logg inn"}
                aria-haspopup="menu"
                className="account-menu__trigger"
              >
                {currentUser ? <CircleUser className="size-4" /> : <LogIn className="size-4" />}
                <span className="account-menu__trigger-label">
                  {currentUser ? (
                    <span className="max-w-[10rem] truncate">{accountLabel}</span>
                  ) : (
                    "Logg inn"
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="account-menu__content">
              {currentUser ? (
                <>
                  <div className="account-menu__identity">
                    <span>Innlogget som</span>
                    <strong>{accountLabel}</strong>
                    {currentUser.name && currentUser.email ? (
                      <small>{currentUser.email}</small>
                    ) : null}
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="minside" {...prefetch("minside")}>
                      <CircleUser className="mr-2 size-4" />
                      Min side
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 size-4" />
                    Logg ut
                  </DropdownMenuItem>
                </>
              ) : (
                <LoginPanel />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
