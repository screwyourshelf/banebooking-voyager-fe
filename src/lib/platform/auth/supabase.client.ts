import type { SupabaseClient } from "@supabase/supabase-js";
import { publicConfig } from "$lib/platform/config";
import { supabaseAuthStorage } from "$lib/platform/storage/browser-storage.client";

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
    if (!publicConfig.supabaseUrl || !publicConfig.supabasePublishableKey) {
      return Promise.reject(new Error("Supabase-konfigurasjon mangler."));
    }

    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      client = createClient(publicConfig.supabaseUrl, publicConfig.supabasePublishableKey, {
        auth: {
          storage: supabaseAuthStorage,
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
