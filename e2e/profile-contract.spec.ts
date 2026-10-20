import { expect, test } from "@playwright/test";
import type { BrukerRespons } from "../src/lib/contracts";
import { updateMyProfile } from "../src/lib/features/account/api";
import { createApiClient } from "../src/lib/platform/api/client";
import { E2E_BACKEND_ORIGIN, E2E_TENANT_SLUG } from "./environment";

test("profile rejection preserves saved data and successful updates refresh the profile", async ({
  request,
}) => {
  const login = await request.post(`${E2E_BACKEND_ORIGIN}/api/dev-auth/login`, {
    data: { profile: "utvidet" },
  });
  expect(login.ok()).toBe(true);
  const { accessToken } = (await login.json()) as { accessToken: string };
  const api = createApiClient({
    baseUrl: `${E2E_BACKEND_ORIGIN}/api`,
    fetch: globalThis.fetch,
    getAuthorization: async () => ({ scheme: "DevelopmentBearer", token: accessToken }),
    onUnauthorized: async () => {
      throw new Error("Local profile session expired");
    },
  });
  const slug = E2E_TENANT_SLUG;
  const readProfile = () =>
    api.request<BrukerRespons>(`klubb/${encodeURIComponent(slug)}/bruker`, { auth: "required" });
  const original = await readProfile();
  const savedName = `Profilkontrakt ${Date.now()}`;

  try {
    // One character reaches domain validation without triggering the DTO's MaxLength check.
    await expect(updateMyProfile(api, slug, { visningsnavn: "X" })).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining("Visningsnavn"),
    });
    expect((await readProfile()).visningsnavn).toBe(original.visningsnavn);

    expect(await updateMyProfile(api, slug, { visningsnavn: ` ${savedName} ` })).toBeUndefined();
    expect(await readProfile()).toMatchObject({
      id: original.id,
      epost: original.epost,
      roller: original.roller,
      visningsnavn: savedName,
    });
  } finally {
    await updateMyProfile(api, slug, { visningsnavn: original.visningsnavn });
    expect((await readProfile()).visningsnavn).toBe(original.visningsnavn);
  }
});
