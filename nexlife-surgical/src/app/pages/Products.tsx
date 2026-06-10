import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import { products, categories } from "../data/products";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const activeCategory = searchParams.get("category") ?? "all";

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === "all" ||
        p.category.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-") === activeCategory;
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const setCategory = (id: string) => {
    if (id === "all") searchParams.delete("category");
    else searchParams.set("category", id);
    setSearchParams(searchParams, { replace: true });
  };

  const activeCategoryLabel =
    activeCategory === "all"
      ? "All Products"
      : categories.find((c) => c.id === activeCategory)?.name ?? "Products";

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="bg-[#F7F8FA]" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Our Catalog
          </p>
          <h1 className="text-[#0D2240]" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            {activeCategoryLabel}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={15} className="text-[#0A8A78]" />
                <span className="text-sm text-[#0D2240]" style={{ fontWeight: 600 }}>Filter by Category</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory("all")}
                  className="w-full text-left px-3 py-2 rounded text-sm transition-colors"
                  style={{
                    backgroundColor: activeCategory === "all" ? "rgba(10,138,120,0.10)" : "transparent",
                    color: activeCategory === "all" ? "#0A8A78" : "#4A5568",
                    fontWeight: activeCategory === "all" ? 600 : 400,
                  }}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between"
                    style={{
                      backgroundColor: activeCategory === cat.id ? "rgba(10,138,120,0.10)" : "transparent",
                      color: activeCategory === cat.id ? "#0A8A78" : "#4A5568",
                      fontWeight: activeCategory === cat.id ? 600 : 400,
                    }}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-slate-400 ml-2">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {/* Search bar */}
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
              <span className="text-sm text-slate-500">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {filtered.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white rounded-lg border border-[#E2E8F0] overflow-hidden transition-all duration-200"
                    style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.06)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(13,34,64,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(13,34,64,0.06)";
                    }}
                  >
                    {product.badge && (
                      <div
                        className="absolute m-3 z-10 text-xs px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: "#0D2240", fontWeight: 600 }}
                      >
                        {product.badge}
                      </div>
                    )}
                    <div className="relative overflow-hidden bg-[#F7F8FA]" style={{ height: "190px" }}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="text-xs text-slate-600 px-3 py-1 rounded bg-white border border-[#E2E8F0]" style={{ fontWeight: 600 }}>
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-4">
                      <p className="text-xs text-[#0A8A78] mb-1" style={{ fontWeight: 500 }}>{product.category}</p>
                      <h3 className="text-[#0D2240] mb-1.5 leading-tight" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-3">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={11} fill="#F59E0B" className="text-amber-400" />
                        ))}
                      </div>
                      <div className="mt-auto flex items-end justify-between gap-2">
                        <div>
                          <div className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1rem" }}>{product.price}</div>
                          <div className="text-xs text-slate-400">{product.priceUnit}</div>
                        </div>
                        <Link
                          to={`/product/${product.slug}`}
                          className="px-3 py-2 rounded text-xs text-white transition-colors"
                          style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
