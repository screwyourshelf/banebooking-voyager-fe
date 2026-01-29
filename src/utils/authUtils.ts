import { supabase } from "@/supabase.js";

const DEFAULT_SLUG = "aas-tennisklubb";

function buildRedirectUrl() {
    const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
    const slug = (localStorage.getItem("slug") || DEFAULT_SLUG).replace(/^\/+|\/+$/g, "");

    return base
        ? `${window.location.origin}${base}/${slug}`
        : `${window.location.origin}/${slug}`;
}

export async function signOutAndRedirect() {
    const redirectTo = buildRedirectUrl();
    await supabase.auth.signOut();
    window.location.assign(redirectTo);
}

