import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BackendWakeUp } from "./BackendWakeUp";

const refresh = vi.fn();
const router = { refresh };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("BackendWakeUp", () => {
  afterEach(() => {
    cleanup();
    refresh.mockReset();
    vi.unstubAllGlobals();
  });

  it("despierta el backend y actualiza la portada automáticamente", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<BackendWakeUp visible />);

    expect(screen.getByRole("status")).toHaveTextContent(/preparando el catálogo/i);
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend-status",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/catálogo está listo/i);
  });

  it("permite reintentar cuando el arranque falla", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<BackendWakeUp visible />);

    const retry = await screen.findByRole("button", { name: /reintentar/i });
    fireEvent.click(retry);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  });

  it("despierta el backend en segundo plano cuando el catálogo ya está visible", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<BackendWakeUp visible={false} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(container).toBeEmptyDOMElement();
    expect(refresh).not.toHaveBeenCalled();
  });
});
