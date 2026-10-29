import { describe, expect, it } from "vitest";

import { resolveBackendAssetUrl } from "./assets";

describe("resolveBackendAssetUrl", () => {
  const baseUrl = "https://api.example.com";

  it("resuelve rutas relativas contra el origen del backend", () => {
    expect(resolveBackendAssetUrl("/uploads/tour.webp", baseUrl)).toBe(
      "https://api.example.com/uploads/tour.webp",
    );
  });

  it("acepta una URL absoluta del mismo origen", () => {
    expect(
      resolveBackendAssetUrl("https://api.example.com/uploads/tour.webp", baseUrl),
    ).toBe("https://api.example.com/uploads/tour.webp");
  });

  it("rechaza protocolos peligrosos y orígenes externos", () => {
    expect(resolveBackendAssetUrl("javascript:alert(1)", baseUrl)).toBeNull();
    expect(resolveBackendAssetUrl("//tracker.example/pixel", baseUrl)).toBeNull();
    expect(
      resolveBackendAssetUrl("https://tracker.example/pixel", baseUrl),
    ).toBeNull();
  });
});
