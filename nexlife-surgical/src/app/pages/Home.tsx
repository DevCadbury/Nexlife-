import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Shield,
  Globe,
  Truck,
  Award,
  ChevronLeft,
  ChevronRight,
  Star,
  BadgeCheck,
} from "lucide-react";
import { categories, featuredProducts } from "../data/products";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1640876777002-badf6aee5bcc?w=1920&q=80&fm=webp",
    tag: "Precision. Purity. Protection.",
    headline: "Surgical Supplies\nTrusted Worldwide",
    sub: "FDA-registered, ISO 13485 certified medical disposables and surgical instruments — delivered to over 40 countries.",
    cta: "Explore Products",
    ctaHref: "/products",
    ctaSecondary: "Get a Quote",
    ctaSecondaryHref: "/contact",
  },
  {
    image: "https://images.unsplash.com/photo-1514416309827-bfb0cf433a2d?w=1920&q=80&fm=webp",
    tag: "Quality at Every Step",
    headline: "Instruments Built\nfor the OR",
    sub: "German-grade stainless steel surgical instruments with lifetime quality guarantee and global service support.",
    cta: "View Instruments",
    ctaHref: "/products?category=surgical-instruments",
    ctaSecondary: "Learn More",
    ctaSecondaryHref: "/about",
  },
  {
    image: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1920&q=80&fm=webp",
    tag: "Bulk Procurement Specialists",
    headline: "Disposable Protection\nat Scale",
    sub: "Gloves, masks, gowns and more — industry-leading AQL standards with competitive bulk pricing for hospitals and distributors.",
    cta: "Request Bulk Quote",
    ctaHref: "/contact",
    ctaSecondary: "All Disposables",
    ctaSecondaryHref: "/products",
  },
];

const trustStats = [
  { value: "40+", label: "Countries Served" },
  { value: "2,500+", label: "Hospital Partners" },
  { value: "98.7%", label: "On-Time Delivery" },
  { value: "ISO 13485", label: "Quality Standard" },
];

const trustFeatures = [
  {
    icon: Shield,
    title: "Rigorous Quality Control",
    description: "Every product undergoes multi-stage QC inspection and 100% electrical/leak testing before dispatch.",
  },
  {
    icon: Truck,
    title: "Reliable Global Logistics",
    description: "Temperature-controlled cold-chain shipping with real-time tracking to 40+ countries worldwide.",
  },
  {
    icon: Award,
    title: "Certified & Compliant",
    description: "FDA 510(k), ISO 13485, CE Marked, and meeting ASTM, EN, and NIOSH standards across our full catalog.",
  },
  {
    icon: Globe,
    title: "Dedicated Account Support",
    description: "Dedicated procurement specialists and 24/7 support for critical orders and bulk hospital contracts.",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentSlide]);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 6000);
  };

  const handlePrev = () => { prevSlide(); resetInterval(); };
  const handleNext = () => { nextSlide(); resetInterval(); };

  return (
    <div>
      {/* ── Hero carousel ── */}
      <section className="relative overflow-hidden bg-[#0D2240]" style={{ height: "min(90vh, 680px)" }}>
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === currentSlide ? 1 : 0, zIndex: i === currentSlide ? 1 : 0 }}
            aria-hidden={i !== currentSlide}
          >
            <img
              src={slide.image}
              alt={slide.headline.replace("\n", " ")}
              className="absolute inset-0 w-full h-full object-cover"
              width={1920}
              height={1080}
              loading={i === 0 ? "eager" : "lazy"}
            />
            {/* Overlay gradient */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(105deg, rgba(8,24,41,0.82) 0%, rgba(8,24,41,0.45) 55%, rgba(8,24,41,0.2) 100%)" }}
            />
          </div>
        ))}

        {/* Content overlay */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-2xl">
            <div
              key={currentSlide + "tag"}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs text-[#0A8A78] mb-4 border"
              style={{
                backgroundColor: "rgba(10,138,120,0.12)",
                borderColor: "rgba(10,138,120,0.3)",
                animation: "fadeSlideUp 0.5s ease both",
                fontWeight: 600,
                letterSpacing: "0.06em",
              }}
            >
              <BadgeCheck size={12} />
              {heroSlides[currentSlide].tag}
            </div>

            <h1
              key={currentSlide + "h1"}
              className="text-white mb-4"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                whiteSpace: "pre-line",
                animation: "fadeSlideUp 0.55s 0.08s ease both",
              }}
            >
              {heroSlides[currentSlide].headline}
            </h1>

            <p
              key={currentSlide + "p"}
              className="text-slate-300 mb-8 max-w-lg"
              style={{
                fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)",
                lineHeight: 1.65,
                animation: "fadeSlideUp 0.6s 0.14s ease both",
              }}
            >
              {heroSlides[currentSlide].sub}
            </p>

            <div
              key={currentSlide + "cta"}
              className="flex flex-wrap gap-3"
              style={{ animation: "fadeSlideUp 0.65s 0.2s ease both" }}
            >
              <Link
                to={heroSlides[currentSlide].ctaHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm text-white transition-all duration-150 active:scale-95"
                style={{ backgroundColor: "#0A8A78", fontWeight: 600, boxShadow: "0 2px 8px rgba(10,138,120,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
              >
                {heroSlides[currentSlide].cta}
                <ArrowRight size={15} />
              </Link>
              <Link
                to={heroSlides[currentSlide].ctaSecondaryHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm text-white transition-all duration-150 hover:bg-white hover:text-[#0D2240]"
                style={{ border: "1px solid rgba(255,255,255,0.35)", fontWeight: 500 }}
              >
                {heroSlides[currentSlide].ctaSecondary}
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { goToSlide(i); resetInterval(); }}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentSlide ? "28px" : "8px",
                backgroundColor: i === currentSlide ? "#0A8A78" : "rgba(255,255,255,0.35)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-105"
          style={{ backgroundColor: "rgba(13,34,64,0.55)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-105"
          style={{ backgroundColor: "rgba(13,34,64,0.55)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </section>

      {/* ── Stats banner ── */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#E2E8F0]">
            {trustStats.map((stat) => (
              <div key={stat.label} className="py-6 px-6 text-center">
                <div
                  className="text-[#0D2240] mb-1"
                  style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 lg:py-20 bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Our Catalog
              </p>
              <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
                Browse by Category
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm text-[#0A8A78] hover:underline shrink-0"
              style={{ fontWeight: 500 }}
            >
              View all products <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="group relative overflow-hidden rounded-lg bg-white border border-[#E2E8F0] transition-all duration-200"
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
                <div className="relative overflow-hidden" style={{ height: "180px" }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width={600}
                    height={360}
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(0deg, rgba(13,34,64,0.55) 0%, rgba(13,34,64,0.1) 60%)" }}
                  />
                  <span
                    className="absolute bottom-3 left-3 text-xs text-white/80 px-2 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(13,34,64,0.55)", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    {cat.count} Products
                  </span>
                </div>
                <div className="px-5 py-4">
                  <h3
                    className="text-[#0D2240] mb-1 group-hover:text-[#0A8A78] transition-colors"
                    style={{ fontSize: "0.95rem", fontWeight: 600 }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Top Sellers
              </p>
              <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
                Featured Products
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm text-[#0A8A78] hover:underline shrink-0"
              style={{ fontWeight: 500 }}
            >
              See all products <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
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
                    className="absolute top-3 left-3 z-10 text-xs px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: "#0D2240", fontWeight: 600 }}
                  >
                    {product.badge}
                  </div>
                )}
                <div className="relative overflow-hidden bg-[#F7F8FA]" style={{ height: "200px" }}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width={400}
                    height={300}
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <p className="text-xs text-[#0A8A78] mb-1" style={{ fontWeight: 500 }}>{product.category}</p>
                  <h3
                    className="text-[#0D2240] mb-1 leading-tight"
                    style={{ fontSize: "0.9rem", fontWeight: 600 }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={11} fill="#F59E0B" className="text-amber-400" />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">(48)</span>
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
        </div>
      </section>

      {/* ── Trust / Value Props ── */}
      <section className="py-16 lg:py-20 bg-[#F7F8FA]" style={{ borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Why Nexlife
            </p>
            <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              The Standard for Medical Excellence
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed" style={{ fontSize: "0.95rem" }}>
              Since 2004, Nexlife International has been the procurement partner of choice for hospitals, distributors, and healthcare systems worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white rounded-lg p-6 border border-[#E2E8F0]"
                  style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.05)" }}
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(10,138,120,0.10)" }}
                  >
                    <Icon size={22} className="text-[#0A8A78]" />
                  </div>
                  <h3 className="text-[#0D2240] mb-2" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ backgroundColor: "#0D2240" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(10,138,120,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#0A8A78] text-xs mb-3" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Ready to Partner?
          </p>
          <h2
            className="text-white mb-4"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em" }}
          >
            Request a Bulk Quote Today
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto" style={{ fontSize: "0.95rem", lineHeight: 1.65 }}>
            Our procurement specialists will respond within 24 hours with competitive pricing for your volume requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-sm text-white transition-all duration-150 active:scale-95"
              style={{ backgroundColor: "#0A8A78", fontWeight: 600, boxShadow: "0 2px 8px rgba(10,138,120,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
            >
              Get a Quote
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-sm text-white transition-all duration-150"
              style={{ border: "1px solid rgba(255,255,255,0.25)", fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              About Nexlife
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
