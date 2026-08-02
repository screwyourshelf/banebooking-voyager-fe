import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { hentUtviklingssession } from "@/auth/developmentSession";
import { notifySessionExpired } from "@/components/feedback/globalFeedback";
import { supabase } from "@/supabase";
import { signOutAndRedirect } from "@/utils/authUtils";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const baseURL = import.meta.env.MODE === "development" || !rawBase ? "/api" : `${rawBase}/api`;

declare module "axios" {
  export interface AxiosRequestConfig {
    requireAuth?: boolean;
  }
}

const api = axios.create({ baseURL, timeout: 20_000 });

let isHandling401 = false;

function setAuthHeader(config: InternalAxiosRequestConfig, token: string, scheme = "Bearer") {
  const headers =
    config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);

  headers.set("Authorization", `${scheme} ${token}`);
  config.headers = headers;
}

function pickErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;
  return (
    (typeof obj.melding === "string" && obj.melding) ||
    (typeof obj.message === "string" && obj.message) ||
    (typeof obj.detail === "string" && obj.detail) ||
    (typeof obj.title === "string" && obj.title) ||
    null
  );
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Alltid legg til token hvis tilgjengelig (gir backend full kontekst).
  // requireAuth styrer om vi må vente på gjenoppretting av en manglende sesjon.
  const developmentSession = hentUtviklingssession();
  if (developmentSession) {
    setAuthHeader(config, developmentSession.accessToken, "DevelopmentBearer");
    return config;
  }

  const token = localStorage.getItem("supabase_token");
  if (token) {
    setAuthHeader(config, token);
    return config;
  }

  // Offentlige kall skal ikke vente på at Supabase gjenoppretter en sesjon.
  // En allerede tilgjengelig token blir fortsatt sendt med for full kontekst.
  if (config.requireAuth === false) {
    return config;
  }

  // Fallback (f.eks rett etter hard reload)
  const { data } = await supabase.auth.getSession();
  const fresh = data.session?.access_token;
  if (fresh) {
    localStorage.setItem("supabase_token", fresh);
    setAuthHeader(config, fresh);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    // ingen response => nettverk/CORS/timeout
    if (!error.response) {
      const msg =
        (error.code === "ECONNABORTED" && "Forespørselen tok for lang tid") ||
        error.message ||
        "Nettverksfeil";
      return Promise.reject(new Error(msg));
    }

    const status = error.response.status;

    if (status === 401) {
      localStorage.removeItem("supabase_token");
      if (!isHandling401) {
        isHandling401 = true;
        try {
          notifySessionExpired();
          await signOutAndRedirect();
        } finally {
          // i tilfelle signOutAndRedirect feiler av en eller annen grunn
          isHandling401 = false;
        }
      }
      return Promise.reject(new Error("Uautorisert"));
    }

    const msg =
      pickErrorMessage(error.response.data) ||
      error.response.statusText ||
      error.message ||
      "Ukjent feil";

    return Promise.reject(new Error(msg));
  }
);

export default api;
