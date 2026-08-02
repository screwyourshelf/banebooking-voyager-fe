import type { ToasterProps } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const APP_TOAST_DURATION_MS = 4_000;
const APP_TOAST_OFFSET: NonNullable<ToasterProps["offset"]> = {
  top: "var(--app-toast-offset)",
};

export default function GlobalFeedbackToaster() {
  return (
    <Toaster
      position="top-center"
      offset={APP_TOAST_OFFSET}
      mobileOffset={APP_TOAST_OFFSET}
      duration={APP_TOAST_DURATION_MS}
    />
  );
}
