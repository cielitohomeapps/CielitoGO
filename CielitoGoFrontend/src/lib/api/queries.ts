import { z } from "zod";

import { apiRequest } from "./client";
import {
  homeContentResponseSchema,
  promotionsResponseSchema,
  publicSettingsResponseSchema,
  quoteRequestSchema,
  quoteResponseSchema,
  toursResponseSchema,
  type QuoteRequest,
} from "./schemas";

const listParametersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(6),
  search: z.string().trim().max(200).optional(),
});

const promotionParametersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(6),
  featured: z.boolean().optional(),
  tourId: z.string().uuid().optional(),
  destination: z.string().trim().max(200).optional(),
});

type RequestOptions = {
  signal?: AbortSignal;
  revalidate?: number | false;
};

const toQueryString = (values: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query.toString();
};

export async function getHomeContent(options: RequestOptions = {}) {
  return apiRequest("/api/content/home", homeContentResponseSchema, {
    signal: options.signal,
    next: { revalidate: options.revalidate ?? 300 },
  });
}

export async function getPublicSettings(options: RequestOptions = {}) {
  return apiRequest("/api/public/settings", publicSettingsResponseSchema, {
    signal: options.signal,
    next: { revalidate: options.revalidate ?? 300 },
  });
}

export async function getTours(
  parameters: z.input<typeof listParametersSchema> = {},
  options: RequestOptions = {},
) {
  const values = listParametersSchema.parse(parameters);
  const query = toQueryString(values);
  return apiRequest(`/api/tours?${query}`, toursResponseSchema, {
    signal: options.signal,
    next: { revalidate: options.revalidate ?? 300 },
  });
}

export async function getPromotions(
  parameters: z.input<typeof promotionParametersSchema> = {},
  options: RequestOptions = {},
) {
  const values = promotionParametersSchema.parse(parameters);
  const query = toQueryString(values);
  return apiRequest(`/api/promotions?${query}`, promotionsResponseSchema, {
    signal: options.signal,
    next: { revalidate: options.revalidate ?? 300 },
  });
}

export async function submitQuote(input: QuoteRequest, signal?: AbortSignal) {
  const payload = quoteRequestSchema.parse(input);
  return apiRequest("/api/quotes", quoteResponseSchema, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal,
  });
}
