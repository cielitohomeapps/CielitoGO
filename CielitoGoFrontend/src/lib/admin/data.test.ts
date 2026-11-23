import { describe, expect, it } from "vitest";

import { asRecord, asRecords, booleanValue, dateValue, getCollection, moneyValue, textValue } from "./data";

describe("admin data helpers", () => {
  it("normalizes records and collections without trusting malformed payloads", () => {
    expect(asRecord(null)).toEqual({});
    expect(asRecords([null, { id: "1" }, "invalid"])).toEqual([{ id: "1" }]);
    expect(getCollection({ tours: [{ id: "1" }] }, "tours")).toEqual([{ id: "1" }]);
  });

  it("formats common admin values safely", () => {
    const row = { name: "Ruta del vino", active: true, price: "2500", currency: "MXN", createdAt: "2026-11-11T12:00:00.000Z" };
    expect(textValue(row, "name")).toBe("Ruta del vino");
    expect(booleanValue(row, "active")).toBe(true);
    expect(moneyValue(row, "price")).toContain("2,500");
    expect(dateValue(row, "createdAt")).not.toBe("—");
  });
});
