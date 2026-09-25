import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(1),
  price: z.number().positive(),
  discountedPrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),

  // BURASI DÜZELDİ
  categoryIds: z.array(z.string()).default([]),

  images: z.array(z.string()).default([]),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const addressSchema = z.object({
  title: z.string().min(1),
  fullName: z.string().min(2),
  phone: z.string().min(6),
  city: z.string().min(1),
  district: z.string().min(1),
  fullAddress: z.string().min(5),
  zipCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
  shippingAddress: z.string().min(5),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string(),
        color: z.string().optional(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const couponSchema = z.object({
  code: z.string().min(2),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minCartAmount: z.number().min(0).optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  usageLimit: z.number().int().nullable().optional(),
  isActive: z.boolean().optional(),
});
