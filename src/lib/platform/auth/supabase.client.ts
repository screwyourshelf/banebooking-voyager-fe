import type { SupabaseClient } from "@supabase/supabase-js";
import { publicConfig } from "$lib/platform/config";
import { supabaseAuthStorage } from "$lib/platform/storage/browser-storage.client";

let clientPromise: Promise<SupabaseClient> | null = null;

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
      return createClient(publicConfig.supabaseUrl, publicConfig.supabasePublishableKey, {
        auth: {
          storage: supabaseAuthStorage,
          persistSession: true,
          autoRefreshToken: true,
          flowType: "pkce",
        },
      });
    });
  }

  return clientPromise;
}
