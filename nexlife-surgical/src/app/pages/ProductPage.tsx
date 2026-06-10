import { useState } from "react";
import { useParams, Link, Navigate } from "react-router";
import {
  ArrowLeft,
  ShoppingCart,
  FileText,
  CheckCircle2,
  Star,
  BadgeCheck,
  Shield,
  Truck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { getProductBySlug, products } from "../data/products";

const certBadges: Record<string, { color: string; bg: string }> = {
  "FDA 510(k)": { color: "#1D4ED8", bg: "#EFF6FF" },
  "FDA EUA": { color: "#1D4ED8", bg: "#EFF6FF" },
  "ISO 13485": { color: "#0A8A78", bg: "#F0FDF9" },
  "CE Marked": { color: "#1E40AF", bg: "#EFF6FF" },
  "EN 455": { color: "#4B5563", bg: "#F9FAFB" },
  "EN 374": { color: "#4B5563", bg: "#F9FAFB" },
  "EN 14683": { color: "#4B5563", bg: "#F9FAFB" },
  "ASTM F2100": { color: "#92400E", bg: "#FFFBEB" },
  "AAMI PB70": { color: "#92400E", bg: "#FFFBEB" },
  "NIOSH Approved": { color: "#166534", bg: "#F0FDF4" },
  "CE FFP2": { color: "#1E40AF", bg: "#EFF6FF" },
  "ISO 7886-1": { color: "#0A8A78", bg: "#F0FDF9" },
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  if (!product) return <Navigate to="/" replace />;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-[#F7F8FA] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-[#0D2240] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link to="/products" className="hover:text-[#0D2240] transition-colors">Products</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-400">{product.category}</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-[#0D2240] truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Back link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0D2240] mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Products
        </Link>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Left: Image gallery ── */}
          <div>
            {/* Main image */}
            <div
              className="rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F7F8FA] mb-3"
              style={{ aspectRatio: "4/3" }}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                width={800}
                height={600}
              />
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="relative overflow-hidden rounded border-2 transition-all duration-150 flex-shrink-0"
                    style={{
                      width: "72px",
                      height: "72px",
                      borderColor: i === selectedImage ? "#0A8A78" : "#E2E8F0",
                    }}
                  >
                    <img
                      src={img}
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
            {/* Category + badge */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-[#0A8A78]" style={{ fontWeight: 600 }}>{product.category}</span>
              {product.badge && (
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#0D2240", color: "#fff", fontWeight: 600 }}
                >
                  {product.badge}
                </span>
              )}
              {!product.inStock && (
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", fontWeight: 500 }}
                >
                  Out of Stock
                </span>
              )}
            </div>

            <h1
              className="text-[#0D2240] mb-3"
              style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.15 }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} fill="#F59E0B" className="text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-slate-500">4.9 · 48 reviews</span>
            </div>

            {/* Price */}
            <div
              className="py-4 mb-5 border-y border-[#E2E8F0] flex items-end gap-3"
            >
              <span
                className="text-[#0D2240]"
                style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}
              >
                {product.price}
              </span>
              <span className="text-sm text-slate-500 mb-0.5">{product.priceUnit}</span>
            </div>

            {/* Short description */}
            <p className="text-slate-600 leading-relaxed mb-6" style={{ fontSize: "0.93rem" }}>
              {product.description}
            </p>

            {/* Certification badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.certifications.map((cert) => {
                const style = certBadges[cert] ?? { color: "#374151", bg: "#F9FAFB" };
                return (
                  <span
                    key={cert}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border"
                    style={{
                      color: style.color,
                      backgroundColor: style.bg,
                      borderColor: `${style.color}25`,
                      fontWeight: 600,
                    }}
                  >
                    <BadgeCheck size={11} />
                    {cert}
                  </span>
                );
              })}
            </div>

            {/* Quantity + Add to cart */}
            {product.inStock ? (
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center rounded border border-[#E2E8F0] overflow-hidden"
                >
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-[#F7F8FA] transition-colors text-lg"
                  >
                    −
                  </button>
                  <span
                    className="w-12 h-11 flex items-center justify-center text-[#0D2240] border-x border-[#E2E8F0]"
                    style={{ fontWeight: 600 }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-[#F7F8FA] transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded text-sm text-white transition-all duration-150 active:scale-[0.98]"
                  style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            ) : (
              <div
                className="py-3 rounded text-center text-sm text-slate-500 mb-4 border border-[#E2E8F0]"
              >
                Currently out of stock
              </div>
            )}

            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 w-full py-3 rounded text-sm transition-all duration-150"
              style={{
                border: "1px solid #0D2240",
                color: "#0D2240",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0D2240") || (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent") || (e.currentTarget.style.color = "#0D2240")}
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
                <div key={text} className="flex flex-col items-center text-center gap-1.5">
                  <Icon size={18} className="text-[#0A8A78]" />
                  <span className="text-xs text-slate-500 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Specifications table ── */}
        <div className="mt-14 lg:mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2
                className="text-[#0D2240] mb-6 pb-3 border-b border-[#E2E8F0]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Technical Specifications
              </h2>
              <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
                {product.specs.map((spec, i) => (
                  <div
                    key={spec.label}
                    className="grid grid-cols-2 text-sm"
                    style={{ borderBottom: i < product.specs.length - 1 ? "1px solid #E2E8F0" : "none" }}
                  >
                    <div
                      className="px-5 py-3.5 text-slate-500"
                      style={{ backgroundColor: "#F7F8FA", fontWeight: 500 }}
                    >
                      {spec.label}
                    </div>
                    <div className="px-5 py-3.5 text-[#0D2240]" style={{ fontWeight: 400 }}>
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar: compliance */}
            <div>
              <h2
                className="text-[#0D2240] mb-6 pb-3 border-b border-[#E2E8F0]"
                style={{ fontWeight: 700, fontSize: "1.25rem" }}
              >
                Compliance & Certifications
              </h2>
              <div className="space-y-3">
                {product.certifications.map((cert) => (
                  <div
                    key={cert}
                    className="flex items-center gap-3 p-3.5 rounded-lg border border-[#E2E8F0]"
                  >
                    <CheckCircle2 size={17} className="text-[#0A8A78] flex-shrink-0" />
                    <span className="text-sm text-[#0D2240]" style={{ fontWeight: 500 }}>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="group flex gap-4 p-4 rounded-lg border border-[#E2E8F0] hover:border-[#0A8A78] transition-all duration-150"
                  style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.04)" }}
                >
                  <div
                    className="flex-shrink-0 rounded overflow-hidden bg-[#F7F8FA]"
                    style={{ width: "72px", height: "72px" }}
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      width={144}
                      height={144}
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">{p.category}</p>
                    <h3
                      className="text-[#0D2240] leading-tight group-hover:text-[#0A8A78] transition-colors text-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {p.name}
                    </h3>
                    <p className="text-sm text-[#0D2240] mt-1" style={{ fontWeight: 700 }}>{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
