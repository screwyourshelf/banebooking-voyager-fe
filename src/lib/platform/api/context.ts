import { createContext } from "svelte";
import type { ApiClient } from "./client";

export const [getApiClient, setApiClient] = createContext<ApiClient>();
