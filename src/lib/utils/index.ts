import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in PLN
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(numPrice);
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TS-${timestamp}-${random}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Format condition enum to human-readable text
 */
export function formatCondition(condition: string): string {
  const map: Record<string, string> = {
    like_new: "Like New",
    very_good: "Very Good",
    good: "Good",
  };
  return map[condition] || condition;
}

/**
 * Format gender enum to human-readable text
 */
export function formatGender(gender: string): string {
  const map: Record<string, string> = {
    men: "Men",
    women: "Women",
    unisex: "Unisex",
  };
  return map[gender] || gender;
}

/**
 * Format order status to human-readable text
 */
export function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    pending_payment: "Pending Payment",
    paid: "Paid",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}

/**
 * Get status badge color classes
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_payment: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
    available: "bg-green-100 text-green-800",
    sold: "bg-gray-100 text-gray-800",
    reserved: "bg-orange-100 text-orange-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Wait for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
