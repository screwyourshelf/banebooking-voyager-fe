import { describe, expect, it, vi } from "vitest";
import { ApiError } from "./api-error";
import { createApiClient, joinApiUrl } from "./client";

function createClient(fetchImplementation: typeof fetch, overrides = {}) {
  return createApiClient({
    fetch: fetchImplementation,
    baseUrl: "https://api.example.test/api/",
    getAuthorization: async () => ({ scheme: "Bearer", token: "access-token" }),
    onUnauthorized: async () => {},
    ...overrides,
  });
}

describe("createApiClient", () => {
  it("kombinerer base URL, auth-header og JSON-body", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "booking-1" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const client = createClient(fetchMock);

    await expect(
      client.request<{ id: string }, { baneId: string }>("/booking", {
        auth: "required",
        method: "POST",
        json: { baneId: "bane-1" },
      })
    ).resolves.toEqual({ id: "booking-1" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.test/api/booking");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer access-token");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(init?.body).toBe(JSON.stringify({ baneId: "bane-1" }));
  });

  it("bevarer utviklingsbackenden sitt eksplisitte authscheme", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    const client = createClient(fetchMock, {
      getAuthorization: async () => ({
        scheme: "DevelopmentBearer" as const,
        token: "development-token",
      }),
    });

    await expect(client.request("bruker", { auth: "required" })).resolves.toBeUndefined();

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "DevelopmentBearer development-token"
    );
  });

  it("hopper over autharbeid og global 401-håndtering for offentlige requests", async () => {
    const getAuthorization = vi.fn(async () => ({
      scheme: "Bearer" as const,
      token: "skal-ikke-brukes",
    }));
    const onUnauthorized = vi.fn(async () => {});
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    const client = createClient(fetchMock, { getAuthorization, onUnauthorized });

    await client.request("offentlig", { auth: "none" });
    await expect(client.request("offentlig-feil", { auth: "none" })).rejects.toMatchObject({
      status: 401,
    });

    expect(getAuthorization).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
    for (const [, init] of fetchMock.mock.calls) {
      expect(new Headers(init?.headers).has("Authorization")).toBe(false);
    }
  });

  it("normaliserer HTTP-feil uten å lagre responsbody i feilen", async () => {
    const client = createClient(
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ melding: "Banen er opptatt", token: "hemmelig" }), {
          status: 409,
          statusText: "Conflict",
          headers: { "content-type": "application/json" },
        })
      )
    );

    const error = await client
      .request("booking", { auth: "required" })
      .catch((reason: unknown) => reason);
    expect(error).toEqual(expect.objectContaining({ message: "Banen er opptatt", status: 409 }));
    expect(JSON.stringify(error)).not.toContain("hemmelig");
  });

  it("håndterer samtidige 401-responser én gang", async () => {
    const onUnauthorized = vi.fn(async () => {});
    const client = createClient(
      vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401 })),
      { onUnauthorized }
    );

    const results = await Promise.allSettled([
      client.request("bookinger", { auth: "required" }),
      client.request("bruker", { auth: "required" }),
    ]);

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect((results[0] as PromiseRejectedResult).reason).toBeInstanceOf(ApiError);
  });

  it("bevarer 401-feilen når utloggingsadapteren feiler", async () => {
    const client = createClient(
      vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401 })),
      { onUnauthorized: async () => Promise.reject(new Error("redirect feilet")) }
    );

    await expect(client.request("bruker", { auth: "required" })).rejects.toEqual(
      expect.objectContaining({ status: 401, message: "Uautorisert" })
    );
  });

  it("skiller timeout fra eksplisitt abort", async () => {
    const pendingFetch = vi.fn<typeof fetch>((_input, init) => {
      return new Promise((_resolve, reject) => {
        const rejectAbort = () => {
          reject(new DOMException("Aborted", "AbortError"));
        };
        if (init?.signal?.aborted) rejectAbort();
        else init?.signal?.addEventListener("abort", rejectAbort, { once: true });
      });
    });
    const timedClient = createClient(pendingFetch, { timeoutMs: 1 });

    await expect(timedClient.request("langsom", { auth: "required" })).rejects.toEqual(
      expect.objectContaining({ code: "timeout" })
    );

    const controller = new AbortController();
    const abortedRequest = createClient(pendingFetch, { timeoutMs: 1_000 }).request("avbrutt", {
      auth: "required",
      signal: controller.signal,
    });
    controller.abort();
    await expect(abortedRequest).rejects.toEqual(expect.objectContaining({ code: "aborted" }));
  });
});

describe("joinApiUrl", () => {
  it("bevarer både relative baser og absolutte URL-er", () => {
    expect(joinApiUrl("/banebooking/api/", "/klubb")).toBe("/banebooking/api/klubb");
    expect(joinApiUrl("", "api/klubb")).toBe("/api/klubb");
    expect(joinApiUrl("/api", "https://other.test/health")).toBe("https://other.test/health");
  });
});
