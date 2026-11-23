export type DataRecord = Record<string, unknown>;

export function asRecord(value: unknown): DataRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DataRecord)
    : {};
}

export function asRecords(value: unknown): DataRecord[] {
  return Array.isArray(value) ? value.filter((item): item is DataRecord => Boolean(item && typeof item === "object")) : [];
}

export function textValue(record: DataRecord, key: string, fallback = "—") {
  const value = record[key];
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function booleanValue(record: DataRecord, key: string) {
  return record[key] === true;
}

export function numberValue(record: DataRecord, key: string) {
  const value = record[key];
  return typeof value === "number" ? value : Number(value) || 0;
}

export function dateValue(record: DataRecord, key: string) {
  const value = record[key];
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function moneyValue(record: DataRecord, key: string, currencyKey = "currency") {
  const amount = Number(record[key]);
  if (!Number.isFinite(amount)) return "—";
  const currency = typeof record[currencyKey] === "string" ? record[currencyKey] : "MXN";
  try {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount.toLocaleString("es-MX")} ${currency}`;
  }
}

export function getCollection(payload: unknown, key: string) {
  return asRecords(asRecord(payload)[key]);
}
