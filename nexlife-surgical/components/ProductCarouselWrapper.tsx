"use client";
import { ProductCarousel } from "@/components/ProductCarousel";
import type { Product } from "@/lib/types/product";

export function ProductCarouselWrapper({ products }: { products: Product[] }) {
  return <ProductCarousel products={products} />;
}
