import { afterEach, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";

import { GET } from "./route";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("espera la respuesta real de disponibilidad antes de invalidar el catálogo", async () => {
  vi.stubEnv("API_BASE_URL", "https://backend.example");
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response("<html>Starting</html>"))
    .mockResolvedValueOnce(Response.json({ status: "ready" }));
  vi.stubGlobal("fetch", fetchMock);
  const request = () => new Request("https://frontend.example/api/backend-status?refresh=1");

  expect((await GET(request())).status).toBe(503);
  expect(revalidatePath).not.toHaveBeenCalled();
  const response = await GET(request());
  expect(await response.json()).toMatchObject({ ready: true });
  expect(fetchMock.mock.calls[0][0].href).toBe("https://backend.example/ready");
  expect(revalidatePath).toHaveBeenCalledWith("/");
});
