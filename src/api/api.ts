import axios, {
    AxiosError,
    AxiosHeaders,
    type InternalAxiosRequestConfig,
} from "axios";
import { supabase } from "@/supabase";
import { signOutAndRedirect } from "@/utils/authUtils";
import { toast } from "sonner";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const baseURL =
    import.meta.env.MODE === "development" || !rawBase ? "/api" : `${rawBase}/api`;

declare module "axios" {
    export interface AxiosRequestConfig {
        requireAuth?: boolean;
    }
}

const api = axios.create({ baseURL, timeout: 20_000 });

let isHandling401 = false;

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
    const headers =
        config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers);

    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
}

function pickErrorMessage(data: unknown): string | null {
    if (!data || typeof data !== "object") return null;

    const obj = data as Record<string, unknown>;
    return (
        (typeof obj.melding === "string" && obj.melding) ||
        (typeof obj.message === "string" && obj.message) ||
        (typeof obj.title === "string" && obj.title) ||
        (typeof obj.detail === "string" && obj.detail) ||
        null
    );
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (!config.requireAuth) return config;

    // Rask path: bruk speilet token (oppdateres via supabase.onAuthStateChange)
    const token = localStorage.getItem("supabase_token");
    if (token) {
        setAuthHeader(config, token);
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
            if (!isHandling401) {
                isHandling401 = true;
                try {
                    toast.error("Du er logget ut. Vennligst logg inn igjen.");
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
