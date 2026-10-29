import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QuoteForm } from "./QuoteForm";

const validResponse = {
  quote: {
    id: "72f522d4-41c6-46c5-8cb7-4c6c65e15941",
    status: "new",
    createdAt: "2026-10-29T16:00:00.000Z",
  },
};

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: "Ana Viajera" } });
  fireEvent.change(screen.getByLabelText(/correo electr/i), { target: { value: "ana@example.com" } });
  fireEvent.change(screen.getByLabelText(/tel.*fono con lada/i), { target: { value: "+52 449 123 4567" } });
  fireEvent.change(screen.getByLabelText(/destino de inter/i), { target: { value: "Patagonia" } });
  fireEvent.click(screen.getByRole("checkbox"));
}

function mockJsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("QuoteForm", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("mantiene el total de viajeros sincronizado con adultos y menores", () => {
    render(<QuoteForm />);

    expect(screen.getByText(/total de viajeros:/i)).toHaveTextContent("2");
    fireEvent.change(screen.getByLabelText(/adultos/i), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText(/menores/i), { target: { value: "2" } });

    expect(screen.getByText(/total de viajeros:/i)).toHaveTextContent("5");
  });

  it("envía el contrato real y muestra confirmación sólo tras un 201", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse(201, validResponse));
    vi.stubGlobal("fetch", fetchMock);
    render(<QuoteForm destinationOptions={["Patagonia"]} />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/adultos/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/menores/i), { target: { value: "1" } });

    fireEvent.submit(screen.getByRole("button", { name: /enviar solicitud/i }).closest("form")!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(request.body))).toMatchObject({
      customerName: "Ana Viajera",
      email: "ana@example.com",
      phone: "+52 449 123 4567",
      destination: "Patagonia",
      adults: 2,
      minors: 1,
      travelers: 3,
    });
    expect(await screen.findByRole("status")).toHaveTextContent(validResponse.quote.id);
  });

  it("no debe anunciar éxito cuando el backend responde 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse(200, validResponse));
    vi.stubGlobal("fetch", fetchMock);
    render(<QuoteForm />);
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("button", { name: /enviar solicitud/i }).closest("form")!);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("button", { name: /enviar solicitud/i })).not.toBeDisabled();
    });
    expect(screen.queryByText(/solicitud recibida/i)).not.toBeInTheDocument();
  });

  it("conserva una respuesta no exitosa como error visible", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockJsonResponse(422, { message: "La solicitud no cumple las reglas de negocio." }),
      ),
    );
    render(<QuoteForm />);
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("button", { name: /enviar solicitud/i }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent("La solicitud no cumple las reglas de negocio.");
    expect(screen.queryByText(/solicitud recibida/i)).not.toBeInTheDocument();
  });

  it("informa que no se envió cuando falla la red", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    render(<QuoteForm />);
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("button", { name: /enviar solicitud/i }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(/tu solicitud no fue enviada/i);
    expect(screen.queryByText(/solicitud recibida/i)).not.toBeInTheDocument();
  });
});
