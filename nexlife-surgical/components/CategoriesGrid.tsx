"use client";

import { CategoryCarousel } from "./CategoryCarousel";

interface CatItem {
  _id: string;
  name: string;
  images: string[];
  productCount: number;
}

export function CategoriesGrid({ categories }: { categories: CatItem[] }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center">
        <p className="text-sm text-slate-400">No categories available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <CategoryCarousel
          key={cat._id}
          catId={cat._id}
          catName={cat.name}
          href={`/products?category=${encodeURIComponent(cat.name)}`}
          images={cat.images}
          productCount={cat.productCount}
        />
      ))}
    </div>
  );
}
