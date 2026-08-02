import { toast } from "sonner";

const SESSION_EXPIRED_TOAST_ID = "session-expired";

export function notifySessionExpired() {
  toast.error("Du er logget ut", {
    id: SESSION_EXPIRED_TOAST_ID,
    description: "Logg inn igjen for å fortsette.",
  });
}
