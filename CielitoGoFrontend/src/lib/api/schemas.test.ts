import { describe, expect, it } from "vitest";

import { quoteRequestSchema } from "./schemas";

const validQuote = {
  customerName: "Ana Pérez",
  phone: "+52 449 000 0000",
  email: "ana@example.com",
  destination: "Patagonia",
  travelers: 3,
  adults: 2,
  minors: 1,
  departureDate: "2027-01-10",
  returnDate: "2027-01-20",
};

describe("quoteRequestSchema", () => {
  it("acepta el contrato público real del backend", () => {
    expect(quoteRequestSchema.safeParse(validQuote).success).toBe(true);
  });

  it("rechaza totales de viajeros inconsistentes", () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      travelers: 4,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["travelers"]);
    }
  });

  it("rechaza una fecha de regreso anterior a la salida", () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      returnDate: "2027-01-09",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["returnDate"]);
    }
  });
});
