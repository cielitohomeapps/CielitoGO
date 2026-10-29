import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "./Header";

vi.mock("next/image", () => ({
  default: ({ priority, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void priority;
    return (
      // The unit test verifies the accessible image contract, not Next.js optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt ?? ""} {...props} />
    );
  },
}));

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}

describe("Header", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete document.body.dataset.menuOpen;
  });

  it("expone marca, navegación y estado activo accesibles", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: /cielito go, inicio/i })).toHaveAttribute("href", "#inicio");
    expect(screen.getByRole("img", { name: "Cielito Go" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /navegaci/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "location");
  });

  it("abre y cierra el menú móvil y sincroniza aria-expanded", () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: /abrir men/i });
    const navigation = screen.getByRole("navigation", { name: /navegaci/i });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(navigation).not.toHaveClass("is-open");

    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: /cerrar men/i })).toHaveAttribute("aria-expanded", "true");
    expect(navigation).toHaveClass("is-open");
    expect(document.body).toHaveAttribute("data-menu-open", "true");

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.getByRole("button", { name: /abrir men/i })).toHaveAttribute("aria-expanded", "false");
    expect(navigation).not.toHaveClass("is-open");
  });

  it("cierra el menú al elegir un destino de navegación", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /abrir men/i }));
    fireEvent.click(screen.getByRole("link", { name: "Destinos" }));

    expect(screen.getByRole("button", { name: /abrir men/i })).toHaveAttribute("aria-expanded", "false");
  });
});
