import { defineParams } from "@sveltejs/kit/params";
import { match } from "./params/tenant.ts";

export const params = defineParams({
  tenant: (param) => (match(param) ? param : undefined),
});
