import type { Product, Category, ProductImage, Order, OrderItem, ShippingZone, ShippingMethod } from "@prisma/client";

// ===========================================
// PRODUCT TYPES
// ===========================================

export type ProductWithImages = Product & {
  images: ProductImage[];
};

export type ProductWithCategory = Product & {
  category: Category;
};

export type ProductFull = Product & {
  category: Category;
  images: ProductImage[];
};

// ===========================================
// ORDER TYPES
// ===========================================

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: ProductWithImages;
  })[];
};

// ===========================================
// SHIPPING TYPES
// ===========================================

export type ShippingZoneWithMethods = ShippingZone & {
  methods: ShippingMethod[];
};

// ===========================================
// CART TYPES
// ===========================================

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string | null;
  imageUrl: string | null;
}

export interface Cart {
  items: CartItem[];
  updatedAt: number;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===========================================
// FILTER TYPES
// ===========================================

export interface ProductFilters {
  categorySlug?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  brand?: string;
  search?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
}

// ===========================================
// FORM TYPES
// ===========================================

export interface FieldError {
  field: string;
  message: string;
}

export interface FormState {
  success: boolean;
  message?: string;
  errors?: FieldError[];
}
