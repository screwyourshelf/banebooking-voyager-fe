import { createContext } from "svelte";
import type { TenantContext } from "./tenant";

export const [getTenantContext, setTenantContext] = createContext<TenantContext>();
