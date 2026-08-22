import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase.client";
import { synkroniserSupabaseToken } from "./supabase-token.client";

export async function completeAuthCallback(timeoutMs = 5_000): Promise<boolean> {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (data.session) {
    syncSession(data.session);
    return true;
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
    let unsubscribe = () => {};
    const finish = (session: Session | null) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      unsubscribe();
      syncSession(session);
      resolve(Boolean(session));
    };

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") finish(session);
    });
    unsubscribe = () => subscription.unsubscribe();
    timeout = setTimeout(() => finish(null), timeoutMs);
  });
}

function syncSession(session: Session | null) {
  synkroniserSupabaseToken(session?.access_token);
}
