import type { APIRequestContext, Page, TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";

const tenantSlug = "aas-tennisklubb";
const clubResponse = {
  slug: tenantSlug,
  navn: "Ås tennisklubb",
  kontaktEpost: "post@example.test",
  feedSynligAntallDager: 14,
};

test.beforeEach(async ({ context }) => {
  await context.route(/\/api\/klubb\/aas-tennisklubb(?:\?.*)?$/, async (route) => {
    await route.fulfill({ json: clubResponse });
  });
});

test("public route loads directly and survives refresh", async ({ page, request }, testInfo) => {
  const routePath = `${tenantSlug}/vilkaar`;
  await expectHostFallbackTwice(request, routePath, testInfo);

  await page.goto(routePath);
  await expect(page.getByRole("heading", { level: 1, name: "Vilkår for bruk" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Vilkår for bruk" })).toBeVisible();
});

for (const protectedRoute of [
  { label: "protected", path: `${tenantSlug}/bookinger` },
  { label: "admin", path: `${tenantSlug}/admin/klubb` },
]) {
  test(`${protectedRoute.label} route loads directly and applies its guard`, async ({
    page,
    request,
  }, testInfo) => {
    await expectHostFallbackTwice(request, protectedRoute.path, testInfo);

    await expectAnonymousGuard(page, protectedRoute.path, testInfo);
    await expectAnonymousGuard(page, protectedRoute.path, testInfo);
  });
}

test("callback route loads its prerendered artifact and survives refresh", async ({
  page,
  request,
}) => {
  const routePath = "auth/callback?returnTo=%2Faas-tennisklubb";
  const directResponse = await request.get(routePath);
  const refreshResponse = await request.get(routePath, {
    headers: { "Cache-Control": "no-cache" },
  });
  expect(directResponse.ok()).toBe(true);
  expect(refreshResponse.ok()).toBe(true);
  expect(directResponse.headers()["x-banebooking-static-fallback"]).toBeUndefined();
  expect(refreshResponse.headers()["x-banebooking-static-fallback"]).toBeUndefined();

  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "setItem", {
      configurable: true,
      value() {
        throw new DOMException("Blocked by production route test", "SecurityError");
      },
    });
  });
  await page.goto(routePath);
  await expect(
    page.getByRole("heading", { level: 1, name: "Kan ikke fullføre innloggingen" })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Kan ikke fullføre innloggingen" })
  ).toBeVisible();
});

async function expectHostFallbackTwice(
  request: APIRequestContext,
  routePath: string,
  testInfo: TestInfo
) {
  const expectedFallback = testInfo.project.name === "base-path" ? "404.html" : "index.html";
  for (const headers of [undefined, { "Cache-Control": "no-cache" }]) {
    const response = await request.get(routePath, { headers });
    expect(response.ok()).toBe(true);
    expect(response.headers()["x-banebooking-static-fallback"]).toBe(expectedFallback);
    const html = await response.text();
    expect(html).toContain('id="root"');
    expect(html).toContain("<title>Banebooking</title>");
  }
}

async function expectAnonymousGuard(page: Page, routePath: string, testInfo: TestInfo) {
  const response = await page.goto(routePath);
  const expectedFallback = testInfo.project.name === "base-path" ? "404.html" : "index.html";
  expect(response?.headers()["x-banebooking-static-fallback"]).toBe(expectedFallback);
  await expect(page).toHaveURL(new RegExp(`${basePathPattern(testInfo)}/${tenantSlug}/login\\?`));
  await expect(page.getByRole("heading", { level: 1, name: "Logg inn" })).toBeVisible();
}

function basePathPattern(testInfo: TestInfo) {
  return testInfo.project.name === "base-path" ? "/banebooking" : "";
}
