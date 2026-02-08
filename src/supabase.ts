import { createClient } from "@supabase/supabase-js";
import { config } from "@/config";

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  const token = session?.access_token;
  if (token) {
    localStorage.setItem("supabase_token", token);
  } else {
    localStorage.removeItem("supabase_token");
  }
});

// Viktig i Vite dev/HMR: unngå multiple subscriptions
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    subscription.unsubscribe();
  });
}
