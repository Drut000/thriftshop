import { z } from "zod";

// ===========================================
// PRODUCT VALIDATORS
// ===========================================

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  oldPrice: z.coerce.number().positive("Old price must be positive").optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  size: z.string().optional(),
  condition: z.enum(["like_new", "very_good", "good"]),
  brand: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  status: z.enum(["available", "sold", "reserved"]).default("available"),
});

export type ProductInput = z.infer<typeof productSchema>;

// ===========================================
// CATEGORY VALIDATORS
// ===========================================

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ===========================================
// ORDER VALIDATORS
// ===========================================

export const shippingAddressSchema = z.object({
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required").default("PL"),
  phone: z.string().optional(),
});

export const checkoutSchema = z.object({
  customerEmail: z.string().email("Valid email is required"),
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().optional(),
  shippingAddress: shippingAddressSchema,
  shippingMethodId: z.string().min(1, "Shipping method is required"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

// ===========================================
// SHIPPING VALIDATORS
// ===========================================

export const shippingZoneSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  countries: z.array(z.string()).default([]),
});

export type ShippingZoneInput = z.infer<typeof shippingZoneSchema>;

export const shippingMethodSchema = z.object({
  zoneId: z.string().min(1, "Zone is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or positive"),
  estimatedDays: z.string().optional(),
  active: z.boolean().default(true),
});

export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>;

// ===========================================
// ADMIN AUTH VALIDATORS
// ===========================================

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
