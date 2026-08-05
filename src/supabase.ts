import type { SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/config";

type ClientListener = (client: SupabaseClient) => void;

let client: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient> | null = null;
const listeners = new Set<ClientListener>();

/**
 * Laster auth-SDK-en først når en lagret sesjon eller en innloggingshandling
 * faktisk trenger den. Offentlige bookingbesøk slipper dermed Supabase-bundlen.
 */
export function getSupabaseClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          flowType: "pkce",
        },
      });

      listeners.forEach((listener) => listener(client!));
      return client;
    });
  }

  return clientPromise;
}

export function onSupabaseClientAvailable(listener: ClientListener) {
  listeners.add(listener);

  if (client) {
    queueMicrotask(() => {
      if (client && listeners.has(listener)) listener(client);
    });
  }

  return () => {
    listeners.delete(listener);
  };
}
