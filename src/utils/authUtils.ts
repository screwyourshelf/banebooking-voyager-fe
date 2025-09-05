import { supabase } from "@/supabase.js";

export async function signOutAndRedirect() {
  const slug = localStorage.getItem("slug") || "";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const redirectTo = `${window.location.origin}${base}/${slug}`;

  await supabase.auth.signOut();

  // Nullstill evt. localStorage/session state
  localStorage.removeItem("supabase_token");

  window.location.href = redirectTo;
}
