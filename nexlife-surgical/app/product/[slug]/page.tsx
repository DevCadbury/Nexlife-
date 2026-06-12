"use client";

import { useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  FileText,
  Shield,
  Truck,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";
import { getProductById, getProducts, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types/product";
import { useCart } from "@/lib/context/CartContext";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addToCart } = useCart();

  // Fetch product
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFoundError(false);

    getProductById(id)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFoundError(true);
        } else {
          setError("Failed to load product. Please try again.");
        }
        setLoading(false);
      });
  }, [id]);

  // Fetch related products once product is loaded
  useEffect(() => {
    if (!product) return;
    getProducts({ site: "surgical", category: product.category })
      .then((res) => {
        const filtered = res.items
          .filter((p) => p._id !== product._id)
          .slice(0, 3);
        setRelatedProducts(filtered);
      })
      .catch(() => {
        // Related products are non-critical — silently ignore errors
      });
  }, [product]);

  // Adapter: create a cart-compatible object from the API product
  const handleAddToCart = () => {
    if (!product) return;
    // Keep images in {secure_url} format so cart page can show them correctly
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price ?? "",
      priceUnit: product.priceUnit ?? "",
      category: product.category,
      images: product.images, // keep as {secure_url, public_id}[] — cart page handles both formats
      slug: product.slug ?? product._id,
      shortDescription: "",
      description: "",
      badge: undefined,
      inStock: true,
      specs: (product.fields ?? []).map((f) => ({ label: f.key, value: f.value })),
      certifications: [],
      _id: product._id,
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    addToCart(cartItem, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    router.push("/cart");
  };

  // Handle 404 by calling notFound() during render
  if (notFoundError) {
    notFound();
  }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        {/* Breadcrumb skeleton */}
        <div className="bg-[#F7F8FA] border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {/* Back link skeleton */}
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image skeleton */}
            <div>
              <div
                className="rounded-lg bg-slate-200 animate-pulse mb-3"
                style={{ aspectRatio: "4/3" }}
              />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded bg-slate-200 animate-pulse flex-shrink-0"
                    style={{ width: "72px", height: "72px" }}
                  />
                ))}
              </div>
            </div>

            {/* Info skeleton */}
            <div>
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-9 w-3/4 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="h-16 w-full bg-slate-200 rounded animate-pulse mb-5" />
              <div className="h-12 w-full bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-12 w-full bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Specs table skeleton */}
          <div className="mt-14 lg:mt-20">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse mb-6" />
            <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-2 border-b border-[#E2E8F0] last:border-b-0">
                  <div className="px-5 py-3.5 bg-[#F7F8FA]">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="px-5 py-3.5">
                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-[#0D2240] mb-3" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
            Something went wrong
          </h2>
          <p className="text-slate-500 mb-6" style={{ fontSize: "0.93rem" }}>
            {error}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-white"
            style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
          >
            <ArrowLeft size={15} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Strip any accidental leading ObjectId (24 hex chars) from name
  const displayName = product.name.replace(/^[a-f0-9]{24}/i, "").trim() || product.name;
  // Strip ObjectId from category display too
  const displayCategory = /^[a-f0-9]{24}$/i.test(product.category) ? "" : product.category;

  const mainImageUrl = product.images[selectedImage]?.secure_url ?? "";
  const showPrice = !!(product.price && !product.hidePrice);
  const visibleFields = (product.fields ?? []).filter((f) => !f.hidden);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-[#F7F8FA] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Products", href: "/products" },
              ...(displayCategory ? [{ label: displayCategory, href: `/products?category=${encodeURIComponent(displayCategory)}` }] : []),
              { label: displayName },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0D2240] mb-8 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-[#0A8A78]/10">
            <ArrowLeft size={15} />
          </div>
          Back to Products
        </Link>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Left: Image gallery ── */}
          <div>
            {/* Main image */}
            <div
              className="relative group rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F7F8FA] mb-3"
              style={{ aspectRatio: "4/3" }}
            >
              {mainImageUrl ? (
                <img
                  src={mainImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  width={800}
                  height={600}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <span style={{ fontSize: "0.85rem" }}>No image available</span>
                </div>
              )}

              {/* Prev / Next arrows + counter (only when multiple images) */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-white/85 text-[#0D2240] shadow-md transition-all duration-150 hover:bg-white hover:scale-105 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-white/85 text-[#0D2240] shadow-md transition-all duration-150 hover:bg-white hover:scale-105 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                  <div
                    className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[11px] text-white"
                    style={{ background: "rgba(13,34,64,0.7)", fontWeight: 600 }}
                  >
                    {selectedImage + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={img.public_id ?? i}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className="relative overflow-hidden rounded border-2 transition-all duration-150 flex-shrink-0"
                    style={{
                      width: "72px",
                      height: "72px",
                      borderColor: i === selectedImage ? "#0A8A78" : "#E2E8F0",
                    }}
                  >
                    <img
                      src={img.secure_url}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                      width={144}
                      height={144}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product info ── */}
          <div>
            {/* Category */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {displayCategory && (
                <span className="text-xs text-[#0A8A78]" style={{ fontWeight: 600 }}>
                  {displayCategory}
                </span>
              )}
            </div>

            <h1
              className="text-[#0D2240] mb-4"
              style={{
                fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
              }}
            >
              {displayName}
            </h1>

            {/* Price */}
            {showPrice && (
              <div className="py-4 mb-5 border-y border-[#E2E8F0] flex items-end gap-3">
                <span
                  className="text-[#0D2240]"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {product.price}
                </span>
                {product.priceUnit && (
                  <span className="text-sm text-slate-500 mb-0.5">
                    {product.priceUnit}
                  </span>
                )}
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center rounded-lg border-2 border-[#E2E8F0] overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-[#F7F8FA] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span
                  className="w-14 h-11 flex items-center justify-center text-[#0D2240] border-x-2 border-[#E2E8F0]"
                  style={{ fontWeight: 700, fontSize: "1rem" }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-[#F7F8FA] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm text-white transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: addedToCart ? "#10B981" : "#0A8A78",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  if (!addedToCart)
                    e.currentTarget.style.backgroundColor = "#098872";
                }}
                onMouseLeave={(e) => {
                  if (!addedToCart)
                    e.currentTarget.style.backgroundColor = "#0A8A78";
                }}
              >
                <ShoppingCart size={16} />
                {addedToCart ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3 rounded-lg text-sm text-white mb-4 transition-all duration-150 active:scale-[0.98]"
              style={{ backgroundColor: "#0D2240", fontWeight: 600 }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1a3a5c")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#0D2240")
              }
            >
              Buy Now
            </button>

            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm transition-all duration-150 border-2"
              style={{
                borderColor: "#E2E8F0",
                color: "#0D2240",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0D2240";
                e.currentTarget.style.backgroundColor = "#F7F8FA";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FileText size={15} />
              Request Bulk Quote
            </Link>

            {/* Trust bar */}
            <div className="mt-6 pt-5 border-t border-[#E2E8F0] grid grid-cols-3 gap-4">
              {[
                { icon: Shield, text: "FDA Registered Facility" },
                { icon: Truck, text: "Global Shipping Available" },
                { icon: RotateCcw, text: "Quality Guarantee" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex flex-col items-center text-center gap-1.5"
                >
                  <Icon size={18} className="text-[#0A8A78]" />
                  <span className="text-xs text-slate-500 leading-tight">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Technical Specifications table ── */}
        {visibleFields.length > 0 && (
          <div className="mt-14 lg:mt-20">
            <h2
              className="text-[#0D2240] mb-6 pb-3 border-b border-[#E2E8F0]"
              style={{ fontWeight: 700, fontSize: "1.25rem" }}
            >
              Technical Specifications
            </h2>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-lg border border-[#E2E8F0] overflow-hidden"
              style={{ background: "#E2E8F0" }}
            >
              {visibleFields.map((field, i) => (
                <div key={`${field.key}-${i}`} className="bg-white px-4 py-3">
                  <div
                    className="text-[11px] uppercase tracking-wide text-slate-500 mb-1"
                    style={{ fontWeight: 700, letterSpacing: "0.04em" }}
                  >
                    {field.key}
                  </div>
                  <div
                    className="text-sm text-[#0D2240]"
                    style={{ fontWeight: 500, wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                  >
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Related products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 lg:mt-20">
            <h2
              className="text-[#0D2240] mb-6"
              style={{ fontWeight: 700, fontSize: "1.25rem" }}
            >
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProducts.map((p) => {
                const relName = p.name.replace(/^[a-f0-9]{24}/i, "").trim() || p.name;
                const relCat = /^[a-f0-9]{24}$/i.test(p.category) ? "" : p.category;
                return (
                <Link
                  key={p._id}
                  href={`/product/${p.slug ?? p._id}`}
                  className="group flex gap-4 p-4 rounded-lg border border-[#E2E8F0] hover:border-[#0A8A78] transition-all duration-150"
                  style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.04)" }}
                >
                  <div
                    className="flex-shrink-0 rounded overflow-hidden bg-[#F7F8FA]"
                    style={{ width: "72px", height: "72px" }}
                  >
                    {p.images[0]?.secure_url ? (
                      <img
                        src={p.images[0].secure_url}
                        alt={relName}
                        className="w-full h-full object-cover"
                        width={144}
                        height={144}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {relCat && (
                      <p className="text-xs text-slate-400 mb-0.5">
                        {relCat}
                      </p>
                    )}
                    <h3
                      className="text-[#0D2240] leading-tight group-hover:text-[#0A8A78] transition-colors text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {relName}
                    </h3>
                    {p.price && !p.hidePrice && (
                      <p
                        className="text-sm text-[#0D2240] mt-1"
                        style={{ fontWeight: 700 }}
                      >
                        {p.price}
                      </p>
                    )}
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
