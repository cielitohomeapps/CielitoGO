import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BackendWakeUp } from "./BackendWakeUp";

const refresh = vi.fn();
const router = { refresh };
const ready = () => Response.json({ ready: true });

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("BackendWakeUp", () => {
  afterEach(() => {
    cleanup();
    refresh.mockReset();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("despierta el backend y actualiza la portada automáticamente", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ready());
    vi.stubGlobal("fetch", fetchMock);

    render(<BackendWakeUp visible />);

    expect(screen.getByRole("status")).toHaveTextContent(/preparando el catálogo/i);
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend-status?refresh=1",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("reintenta automáticamente si recibe HTML o un 503 durante el arranque", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("<html>Starting</html>"))
      .mockResolvedValueOnce(Response.json({ ready: false }, { status: 503 }))
      .mockResolvedValueOnce(ready());
    vi.stubGlobal("fetch", fetchMock);

    render(<BackendWakeUp visible />);
    await act(async () => vi.advanceTimersByTimeAsync(6_000));

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("permite reintentar cuando el arranque falla", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ code: "API_NOT_CONFIGURED" }, { status: 503 }))
      .mockResolvedValueOnce(ready());
    vi.stubGlobal("fetch", fetchMock);

    render(<BackendWakeUp visible />);

    const retry = await screen.findByRole("button", { name: /reintentar/i });
    fireEvent.click(retry);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  });

  it("despierta el backend en segundo plano cuando el catálogo ya está visible", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ready());
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<BackendWakeUp visible={false} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(container).toBeEmptyDOMElement();
    expect(refresh).not.toHaveBeenCalled();
  });
});
