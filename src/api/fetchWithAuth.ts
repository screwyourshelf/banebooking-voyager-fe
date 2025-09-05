import { signOutAndRedirect } from "@/utils/authUtils.js";
import { toast } from "sonner";

const baseUrl =
  import.meta.env.MODE === "development"
    ? "" // bruk proxy lokalt
    : import.meta.env.VITE_API_BASE_URL || "";

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {},
  requireAuth = false
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  if (requireAuth) {
    const token = localStorage.getItem("supabase_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url =
    typeof input === "string" && input.startsWith("/")
      ? baseUrl + input
      : input;

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text();

    if (res.status === 401) {
      toast.error("Du er logget ut. Vennligst logg inn igjen.");
      await signOutAndRedirect();
    }

    throw new Error(text || `Feil (${res.status}): ${res.statusText}`);
  }

  return res;
}
