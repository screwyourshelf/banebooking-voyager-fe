import { useLayoutEffect, type ReactNode } from "react";

const RECOVERY_STORAGE_KEY = "banebooking:asset-recovery-at";
const RECOVERY_QUERY_PARAMETER = "_app_reload";

export default function BootHandoff({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    document.getElementById("boot")?.remove();

    const recoveryUrl = new URL(window.location.href);
    if (recoveryUrl.searchParams.has(RECOVERY_QUERY_PARAMETER)) {
      recoveryUrl.searchParams.delete(RECOVERY_QUERY_PARAMETER);
      window.history.replaceState(
        window.history.state,
        "",
        `${recoveryUrl.pathname}${recoveryUrl.search}${recoveryUrl.hash}`
      );
    }

    try {
      sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
    } catch {
      // Safari kan blokkere nettleserlagring i enkelte moduser.
    }
  }, []);

  return children;
}
