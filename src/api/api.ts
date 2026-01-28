import axios, { AxiosHeaders } from "axios";
import { supabase } from "@/supabase";
import { signOutAndRedirect } from "@/utils/authUtils.js";
import { toast } from "sonner";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const baseURL =
    import.meta.env.MODE === "development"
        ? "/api"
        : `${rawBase}/api`;

declare module "axios" {
    export interface AxiosRequestConfig {
        requireAuth?: boolean;
    }
}

const api = axios.create({ baseURL, timeout: 20_000 });

api.interceptors.request.use(async (config) => {
    if (!config.requireAuth) return config;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return config;

    const headers =
        config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers);

    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status: number | undefined = error.response?.status;

        if (status === 401) {
            toast.error("Du er logget ut. Vennligst logg inn igjen.");
            await signOutAndRedirect();
            return Promise.reject(new Error("Uautorisert"));
        }

        const data = error.response?.data;

        const msg =
            data?.melding ||
            data?.message ||
            data?.title ||
            data?.detail ||
            error.response?.statusText ||
            error.message ||
            "Ukjent feil";

        return Promise.reject(new Error(msg));
    }
);

export default api;
