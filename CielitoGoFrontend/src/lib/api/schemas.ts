import { z } from "zod";

const nullableString = z.string().nullable().optional();
const decimalValue = z.union([
  z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  z.number().nonnegative(),
]);
const optionalPublicUrl = z
  .union([z.string().url(), z.literal("")])
  .nullable()
  .optional();
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato AAAA-MM-DD");

export const paginationSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive().optional(),
  pages: z.number().int().nonnegative(),
});

export const backendImageSchema = z
  .object({
    id: z.string().uuid(),
    imageUrl: z.string().min(1),
    alt: nullableString,
    sortOrder: z.number().int().default(0),
    isPrimary: z.boolean().default(false),
  })
  .passthrough();

export const tourSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string(),
    shortDescription: nullableString,
    duration: z.string().min(1),
    price: decimalValue,
    currency: z.string().length(3),
    capacity: z.number().int().nonnegative(),
    difficulty: z.enum(["easy", "moderate", "hard", "extreme"]),
    location: nullableString,
    highlights: z.array(z.unknown()),
    includes: z.array(z.unknown()),
    excludes: z.array(z.unknown()),
    restrictions: z.array(z.unknown()),
    conditions: z.array(z.unknown()),
    itinerary: z.array(z.unknown()),
    imageUrl: nullableString,
    images: z.array(backendImageSchema).default([]),
    metaTitle: nullableString,
    metaDescription: nullableString,
  })
  .passthrough();

export const toursResponseSchema = z.object({
  tours: z.array(tourSchema),
  pagination: paginationSchema,
});

export const promotionSchema = z
  .object({
    id: z.string().uuid(),
    tourId: z.string().uuid().nullable().optional(),
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string(),
    destination: nullableString,
    promotionalPrice: decimalValue.nullable().optional(),
    currency: z.string().length(3),
    startDate: nullableString,
    endDate: nullableString,
    restrictions: z.array(z.unknown()),
    conditions: z.array(z.unknown()),
    imageUrl: nullableString,
    isFeatured: z.boolean(),
    images: z.array(backendImageSchema).default([]),
    tour: z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1),
        slug: z.string().min(1),
        isActive: z.boolean(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export const promotionsResponseSchema = z.object({
  promotions: z.array(promotionSchema),
  pagination: paginationSchema,
});

export const contentItemSchema = z.object({
  value: z.unknown(),
  type: z.enum(["text", "image", "json", "boolean", "number", "link"]),
  metadata: z.unknown().nullable().optional(),
});

export const homeContentResponseSchema = z.object({
  page: z.literal("home"),
  content: z.record(z.string(), z.record(z.string(), contentItemSchema)),
});

export const publicSettingsResponseSchema = z.object({
  settings: z
    .object({
      site_name: z.string().nullable().optional(),
      site_logo: z.string().nullable().optional(),
      site_email: z.string().nullable().optional(),
      site_phone: z.string().nullable().optional(),
      whatsapp_number: z.string().nullable().optional(),
      facebook_url: optionalPublicUrl,
      instagram_url: optionalPublicUrl,
    })
    .passthrough(),
});

export const quoteRequestSchema = z
  .object({
    customerName: z.string().trim().min(2).max(200),
    phone: z.string().trim().min(7).max(50),
    email: z.string().trim().email().max(320),
    destination: z.string().trim().min(2).max(200),
    travelers: z.number().int().min(1).max(100),
    adults: z.number().int().min(1).max(100),
    minors: z.number().int().min(0).max(100).default(0),
    departureDate: isoDate.nullable().optional(),
    returnDate: isoDate.nullable().optional(),
    budget: z.number().nonnegative().nullable().optional(),
    comments: z.string().max(5000).nullable().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.travelers !== value.adults + value.minors) {
      context.addIssue({
        code: "custom",
        path: ["travelers"],
        message: "El total debe coincidir con adultos más menores",
      });
    }

    if (
      value.departureDate &&
      value.returnDate &&
      value.returnDate < value.departureDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "La fecha de regreso debe ser igual o posterior a la salida",
      });
    }
  });

export const quoteResponseSchema = z.object({
  quote: z.object({
    id: z.string().uuid(),
    status: z.literal("new"),
    createdAt: z.string().min(1),
  }),
});

export type Pagination = z.infer<typeof paginationSchema>;
export type BackendImage = z.infer<typeof backendImageSchema>;
export type Tour = z.infer<typeof tourSchema>;
export type ToursResponse = z.infer<typeof toursResponseSchema>;
export type Promotion = z.infer<typeof promotionSchema>;
export type PromotionsResponse = z.infer<typeof promotionsResponseSchema>;
export type HomeContentResponse = z.infer<typeof homeContentResponseSchema>;
export type PublicSettingsResponse = z.infer<
  typeof publicSettingsResponseSchema
>;
export type QuoteRequest = z.input<typeof quoteRequestSchema>;
export type ValidatedQuoteRequest = z.output<typeof quoteRequestSchema>;
export type QuoteResponse = z.infer<typeof quoteResponseSchema>;
