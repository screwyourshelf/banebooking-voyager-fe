import { readPublicConfig } from "./public-config";

export const publicConfig = readPublicConfig(import.meta.env);
