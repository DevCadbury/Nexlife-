"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, LayoutGrid, List } from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import type { Product, Category } from "@/lib/types/product";
import { Breadcrumb } from "@/components/Breadcrumb";

// The frontend is always the surgical site
const SITE = "surgical";

export default function Products() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const activeCategory = searchParams.get("category") ?? "all";
  const searchParamCategory = activeCategory !== "all" ? activeCategory : undefined;

  const { data: productsData, error: productsError, isLoading: productsLoading } = useProducts({
    site: SITE,
    category: searchParamCategory,
  });
  const { data: categoriesData } = useCategories(SITE);

  const rawProducts = productsData?.items ?? [];
  // Strip ObjectId prefix from product names (e.g. "6a271c3e080885a608040648TEST" → "TEST")
  const allProducts = rawProducts.map((p) => ({
    ...p,
    name: p.name.replace(/^[a-f0-9]{24}/i, "").trim() || p.name,
  }));
  const allCategories = (categoriesData?.items ?? [])
    .filter((c) => !/^[a-f0-9]{24}$/i.test(c.name)); // exclude ObjectId-named categories

  // Helper: resolve a category value that might be a MongoDB ObjectId string to a readable name
  const resolveCategoryName = (rawCat: string): string => {
    if (!rawCat) return "";
    // If it looks like a 24-char hex ObjectId, try to find the matching category by _id
    if (/^[a-f0-9]{24}$/i.test(rawCat)) {
      const match = allCategories.find((c) => c._id === rawCat);
      return match?.name ?? rawCat;
    }
    return rawCat;
  };

  const filtered = useMemo(() => {
    if (!search) return allProducts;
    const q = search.toLowerCase();
    return allProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [allProducts, search]);

  // Use router.push so useSearchParams triggers a re-render and hook re-fetches
  const setCategory = useCallback((name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (name === "all") params.delete("category");
    else params.set("category", name);
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const activeCategoryLabel =
    activeCategory === "all"
      ? "All Products"
      : allCategories.find((c) => c.name === activeCategory)?.name ?? activeCategory;

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="bg-[#F7F8FA]" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <Breadcrumb
            items={[
              { label: "Products", href: "/products" },
              { label: activeCategoryLabel },
            ]}
          />
          <h1 className="text-[#0D2240] mt-2" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            {activeCategoryLabel}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 border-[#E2E8F0] text-sm text-[#0D2240] hover:border-[#0A8A78] transition-colors"
              style={{ fontWeight: 600 }}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#0A8A78]" />
                Filters
                {activeCategory !== "all" && (
                  <span className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#0A8A78" }}>
                    1
                  </span>
                )}
              </span>
              <ChevronDown
                size={16}
                className="transition-transform duration-200"
                style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0)" }}
              />
            </button>
          </div>

          {/* Sidebar filters */}
          <aside className={`lg:w-60 flex-shrink-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <div className="lg:sticky lg:top-24 bg-white lg:bg-transparent rounded-lg border lg:border-0 border-[#E2E8F0] p-4 lg:p-0 mb-4 lg:mb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-[#0A8A78]" />
                  <span className="text-sm text-[#0D2240]" style={{ fontWeight: 600 }}>Filter by Category</span>
                </div>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCategory("all");
                    setFiltersOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-sm transition-colors"
                  style={{
                    backgroundColor: activeCategory === "all" ? "rgba(10,138,120,0.10)" : "transparent",
                    color: activeCategory === "all" ? "#0A8A78" : "#4A5568",
                    fontWeight: activeCategory === "all" ? 600 : 400,
                  }}
                >
                  All Products
                </button>
                {allCategories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      setCategory(cat.name);
                      setFiltersOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded text-sm transition-colors"
                    style={{
                      backgroundColor: activeCategory === cat.name ? "rgba(10,138,120,0.10)" : "transparent",
                      color: activeCategory === cat.name ? "#0A8A78" : "#4A5568",
                      fontWeight: activeCategory === cat.name ? 600 : 400,
                    }}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {/* Search bar and view options */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded border border-[#E2E8F0] text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 hidden sm:inline">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </span>

                {/* View mode toggle */}
                <div className="flex items-center gap-1 p-1 rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className="p-2 rounded transition-all duration-200"
                    style={{
                      backgroundColor: viewMode === "grid" ? "rgba(10,138,120,0.12)" : "transparent",
                      color: viewMode === "grid" ? "#0A8A78" : "#64748B",
                    }}
                    title="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className="p-2 rounded transition-all duration-200"
                    style={{
                      backgroundColor: viewMode === "list" ? "rgba(10,138,120,0.12)" : "transparent",
                      color: viewMode === "list" ? "#0A8A78" : "#64748B",
                    }}
                    title="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#E2E8F0] overflow-hidden bg-white"
                  >
                    <div className="bg-slate-200 animate-pulse" style={{ height: "200px" }} />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                      <div className="h-9 w-full bg-slate-100 rounded animate-pulse mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productsError ? (
              <div className="rounded-lg border border-[#E2E8F0] p-10 text-center">
                <p className="text-sm text-slate-500">Unable to load products. Please try again.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Search size={36} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">No products found for your search.</p>
                <button
                  onClick={() => { setSearch(""); setCategory("all"); }}
                  className="mt-3 text-sm text-[#0A8A78] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug ?? product._id}`}
                    className="group relative flex flex-col bg-white rounded-lg border border-[#E2E8F0] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#0A8A78]/20 active:scale-[0.98] touch-manipulation"
                    style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.06)" }}
                  >
                    <div className="relative overflow-hidden bg-[#F7F8FA]" style={{ height: "200px" }}>
                      <img
                        src={product.images[0]?.secure_url ?? ""}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col flex-1 p-4">
                      <p className="text-xs text-[#0A8A78] mb-1" style={{ fontWeight: 500 }}>{resolveCategoryName(product.category)}</p>
                      <h3 className="text-[#0D2240] mb-1.5 leading-tight group-hover:text-[#0A8A78] transition-colors" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {product.name}
                      </h3>
                      <div className="mt-auto flex items-end justify-between gap-2">
                        {product.price && !product.hidePrice ? (
                          <div>
                            <div className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1rem" }}>{product.price}</div>
                            {product.priceUnit && (
                              <div className="text-xs text-slate-400">{product.priceUnit}</div>
                            )}
                          </div>
                        ) : (
                          <div />
                        )}
                        <div
                          className="px-3 py-2 rounded text-xs text-white transition-all duration-200 group-hover:bg-[#098872]"
                          style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
                        >
                          View Details
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug ?? product._id}`}
                    className="group relative flex flex-col sm:flex-row bg-white rounded-lg border border-[#E2E8F0] overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#0A8A78]/20 active:scale-[0.99] touch-manipulation"
                    style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.06)" }}
                  >
                    <div className="relative overflow-hidden bg-[#F7F8FA] sm:w-64 flex-shrink-0" style={{ height: "200px" }}>
                      <img
                        src={product.images[0]?.secure_url ?? ""}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <p className="text-xs text-[#0A8A78] mb-1.5" style={{ fontWeight: 500 }}>{resolveCategoryName(product.category)}</p>
                          <h3 className="text-[#0D2240] mb-2 leading-tight group-hover:text-[#0A8A78] transition-colors" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                            {product.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          {product.price && !product.hidePrice ? (
                            <>
                              <div className="text-[#0D2240] mb-1" style={{ fontWeight: 700, fontSize: "1.25rem" }}>{product.price}</div>
                              {product.priceUnit && (
                                <div className="text-xs text-slate-400 mb-4">{product.priceUnit}</div>
                              )}
                            </>
                          ) : (
                            <div className="mb-4" />
                          )}
                          <button
                            className="px-4 py-2.5 rounded-lg text-sm text-white transition-all duration-200 hover:bg-[#098872] hover:shadow-lg whitespace-nowrap"
                            style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
