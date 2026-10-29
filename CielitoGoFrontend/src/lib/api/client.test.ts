import { afterEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "./client";
import { ApiContractError } from "./errors";
import { publicSettingsResponseSchema } from "./schemas";

describe("apiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.API_BASE_URL;
  });

  it("valida una respuesta exitosa", async () => {
    process.env.API_BASE_URL = "https://api.example.com";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ settings: { site_name: "Cielito Go" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      apiRequest("/api/public/settings", publicSettingsResponseSchema),
    ).resolves.toEqual({ settings: { site_name: "Cielito Go" } });
  });

  it("normaliza el formato de error heredado", async () => {
    process.env.API_BASE_URL = "https://api.example.com";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "No encontrado" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      apiRequest("/api/public/settings", publicSettingsResponseSchema),
    ).rejects.toMatchObject({
      status: 404,
      code: "BACKEND_REQUEST_ERROR",
      message: "No encontrado",
    });
  });

  it("rechaza respuestas que incumplen el contrato", async () => {
    process.env.API_BASE_URL = "https://api.example.com";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ settings: { instagram_url: "no-es-url" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(
      apiRequest("/api/public/settings", publicSettingsResponseSchema),
    ).rejects.toBeInstanceOf(ApiContractError);
  });
});
