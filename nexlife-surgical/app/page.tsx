"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Globe,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Users,
  Building2,
  Heart,
} from "lucide-react";
import { ImageCarousel } from "@/components/ImageCarousel";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProducts } from "@/lib/hooks/useProducts";
import { ProductCarousel } from "@/components/ProductCarousel";
import { useSiteContext } from "@/lib/context/SiteContext";
import { useFeaturedProducts } from "@/lib/hooks/useFeaturedProducts";
import { useStarredProducts } from "@/lib/hooks/useStarredProducts";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { SectionDivider } from "@/components/SectionDivider";

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
    iconSrc: "/ICONS/customer-service.png",
    title: "Client Satisfaction",
    description: "Your satisfaction is our top priority. We aim to exceed your expectations with every interaction and delivery.",
  },
  {
    iconSrc: "/ICONS/transportation.png",
    title: "Supply Chain Reliability",
    description: "Timeliness is critical in the pharmaceutical industry. We ensure reliable and consistent supply chain management.",
  },
  {
    iconSrc: "/ICONS/best-product.png",
    title: "Competitive Pricing",
    description: "We offer competitive and affordable pricing without compromising on quality or service standards.",
  },
  {
    iconSrc: "/ICONS/internet.png",
    title: "Global Reach",
    description: "Delivering quality healthcare products across borders to over 50+ countries worldwide.",
  },
];

const companyPillars = [
  {
    icon: Users,
    title: "EMPLOYEE'S",
    description: "Our dedicated team of professionals",
    stat: "100+",
  },
  {
    icon: Heart,
    title: "MEDICINE",
    description: "Quality pharmaceutical products",
    stat: "500+",
  },
  {
    icon: Building2,
    title: "CUSTOMERS",
    description: "Customer satisfaction first",
    stat: "1000+",
  },
  {
    icon: Globe,
    title: "COUNTRIES",
    description: "Global presence worldwide",
    stat: "50+",
  },
];

const coreValues = [
  {
    iconSrc: "/ICONS/focus.png",
    title: "Our Mission",
    description: "At Nexlife International, our mission is clear: we aim to improve lives by providing affordable, high-quality pharmaceutical solutions to healthcare providers worldwide. We are committed to bridging the gap between pharmaceutical innovation and accessibility.",
  },
  {
    iconSrc: "/ICONS/future.png",
    title: "Our Vision",
    description: "At Nexlife International, our vision is to enhance global access to high-quality, affordable pharmaceutical products. We envision a world where quality healthcare is accessible to everyone, regardless of geographical boundaries.",
  },
  {
    iconSrc: "/ICONS/goal.png",
    title: "Our Goal",
    description: "At Nexlife International, our overarching goal is to lead the pharmaceutical export industry through innovation, reliability, and customer-centric approaches. We strive to become the most trusted partner in global pharmaceutical trade.",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Chief Procurement Officer",
    company: "Healthcare Solutions Ltd.",
    location: "United Kingdom",
    text: "Working with Nexlife International has transformed our supply chain. Their reliability and quality standards are unmatched in the industry.",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "Distribution Manager",
    company: "MedTech Distributors",
    location: "UAE",
    text: "Exceptional service and consistent product quality. Nexlife has been our trusted partner for over 5 years now.",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "Hospital Administrator",
    company: "Regional Medical Center",
    location: "Spain",
    text: "Their competitive pricing and on-time delivery have made them our go-to supplier for pharmaceutical products.",
    rating: 5,
  },
];

export default function Home() {
  const { site } = useSiteContext();
  const { data: featuredData, error: featuredError, isLoading: featuredLoading } = useFeaturedProducts(site);
  const { data: starredData, isLoading: starredLoading } = useStarredProducts(site);
  const featuredProducts = featuredData?.items ?? [];
  const starredProducts = starredData?.items ?? [];

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories("surgical");
  const { data: allProductsData } = useProducts({ site: "surgical" });
  const apiCategories = categoriesData?.items ?? [];
  const apiAllProducts = allProductsData?.items ?? [];

  // Build a lookup map: category ObjectId → category name (for resolving old products)
  const catIdToName = new Map(apiCategories.map((c) => [c._id, c.name]));

  // Resolve a product's category to a name (handles both name and ObjectId stored values)
  const resolveProductCategoryFrontend = (raw: string) => {
    if (!raw) return "";
    if (/^[a-f0-9]{24}$/i.test(raw)) return catIdToName.get(raw) ?? raw;
    return raw;
  };

  // Only show top 6 visible categories sorted by sequence, exclude any with ObjectId names
  const visibleCategories = apiCategories
    .filter((c) => c.visible && !/^[a-f0-9]{24}$/i.test(c.name))
    .slice(0, 6);

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
            <Image
              src={slide.image}
              alt={slide.headline.replace("\n", " ")}
              className="absolute inset-0 w-full h-full object-cover"
              fill
              priority={i === 0}
              sizes="100vw"
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
                href={heroSlides[currentSlide].ctaHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm text-white transition-all duration-150 active:scale-95"
                style={{ backgroundColor: "#0A8A78", fontWeight: 600, boxShadow: "0 2px 8px rgba(10,138,120,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
              >
                {heroSlides[currentSlide].cta}
                <ArrowRight size={15} />
              </Link>
              <Link
                href={heroSlides[currentSlide].ctaSecondaryHref}
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
              className="h-1.5 rounded-full transition-all duration-300 touch-manipulation"
              style={{
                width: i === currentSlide ? "28px" : "8px",
                backgroundColor: i === currentSlide ? "#0A8A78" : "rgba(255,255,255,0.35)",
                minWidth: "20px",
                minHeight: "20px",
                padding: "8px"
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-105 active:scale-95 touch-manipulation"
          style={{ backgroundColor: "rgba(13,34,64,0.55)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-105 active:scale-95 touch-manipulation"
          style={{ backgroundColor: "rgba(13,34,64,0.55)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </section>

      <SectionDivider className="bg-white" />

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

      <SectionDivider className="bg-[#F7F8FA]" />

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
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm text-[#0A8A78] hover:underline shrink-0"
              style={{ fontWeight: 500 }}
            >
              View all products <ArrowRight size={14} />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#E2E8F0] bg-white animate-pulse"
                  style={{ height: "360px" }}
                />
              ))}
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center">
              <p className="text-sm text-slate-400">No categories available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCategories.map((cat) => {
                // Match products by name OR by ObjectId (for old products with stale category field)
                const categoryProducts = apiAllProducts
                  .filter(p => resolveProductCategoryFrontend(p.category) === cat.name)
                  .slice(0, 6);
                const carouselImages = categoryProducts
                  .map(p => p.images[0]?.secure_url)
                  .filter(Boolean) as string[];
                const images = carouselImages.length > 0 ? carouselImages : ["/our-product-bg.png"];
                const productCount = apiAllProducts.filter(p => resolveProductCategoryFrontend(p.category) === cat.name).length;

                return (
                  <Link
                    key={cat._id}
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="group relative overflow-hidden rounded-xl bg-white border border-[#E2E8F0] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[#0A8A78]/20"
                    style={{ boxShadow: "0 2px 8px rgba(13,34,64,0.08)" }}
                  >
                    {/* Product count badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm transition-all duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: "rgba(13,34,64,0.85)",
                          boxShadow: "0 2px 8px rgba(13,34,64,0.3)",
                        }}
                      >
                        <span className="text-xs text-white/90 font-semibold">{productCount} Products</span>
                      </div>
                    </div>

                    <div className="relative overflow-hidden" style={{ height: "280px" }}>
                      <ImageCarousel
                        images={images}
                        alt={cat.name}
                        autoPlay={true}
                        interval={3500}
                        height="100%"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(180deg, transparent 0%, transparent 70%, rgba(13,34,64,0.03) 100%)" }}
                      />
                    </div>

                    <div className="px-5 py-4 bg-gradient-to-b from-white to-[#F7F8FA] group-hover:from-[#F7F8FA] group-hover:to-white transition-all duration-300">
                      <h3
                        className="text-[#0D2240] group-hover:text-[#0A8A78] transition-colors"
                        style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                      >
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SectionDivider className="bg-white" />

      {/* ── Starred / Order Products ── */}
      {(starredProducts.length > 0 || starredLoading) && (
        <section className="py-16 lg:py-20 bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Ready to Order
                </p>
                <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
                  Featured / Order Products
                </h2>
              </div>
              <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-[#0A8A78] hover:underline shrink-0" style={{ fontWeight: 500 }}>
                View all products <ArrowRight size={14} />
              </Link>
            </div>
            {starredLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-[#E2E8F0] bg-white animate-pulse" style={{ height: "320px" }} />
                ))}
              </div>
            ) : (
              <ProductCarousel products={starredProducts} />
            )}
          </div>
        </section>
      )}

      {(starredProducts.length > 0 || starredLoading) && <SectionDivider className="bg-white" />}

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
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm text-[#0A8A78] hover:underline shrink-0"
              style={{ fontWeight: 500 }}
            >
              See all products <ArrowRight size={14} />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border border-[#E2E8F0] bg-[#F7F8FA] animate-pulse" style={{ height: "320px" }} />
              ))}
            </div>
          ) : featuredError ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#FFF8F8] p-8 text-center">
              <p className="text-sm text-slate-500">Unable to load products. Please try again.</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F7F8FA] p-8 text-center">
              <p className="text-sm text-slate-400">No featured products available.</p>
            </div>
          ) : (
            <ProductCarousel products={featuredProducts} />
          )}
        </div>
      </section>

      <SectionDivider className="bg-[#F7F8FA]" />

      {/* ── Why Choose Us ── */}
      <section className="py-16 lg:py-20 bg-[#F7F8FA]" style={{ borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Why Choose Us?
            </p>
            <h2 className="text-[#0D2240] mb-3" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Excellence in Every Aspect
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "0.95rem" }}>
              We are committed to delivering excellence in every aspect of our pharmaceutical services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feat, idx) => {
              return (
                <div
                  key={feat.title}
                  className="group bg-white rounded-xl p-6 border border-[#E2E8F0] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#0A8A78]/30"
                  style={{
                    boxShadow: "0 2px 8px rgba(13,34,64,0.06)",
                    animation: `scale-in 0.5s ease-out ${idx * 0.08}s both`,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: "rgba(10,138,120,0.12)",
                    }}
                  >
                    <Image
                      src={feat.iconSrc}
                      alt={feat.title}
                      width={30}
                      height={30}
                      className="w-[30px] h-[30px] object-contain"
                    />
                  </div>
                  <h3
                    className="text-[#0D2240] mb-2 group-hover:text-[#0A8A78] transition-colors duration-300"
                    style={{ fontSize: "1rem", fontWeight: 700 }}
                  >
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider className="bg-white" />

      {/* ── Company Pillars ── */}
      <section className="py-16 lg:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              NEXLIFE INTERNATIONAL STANDS FOR
            </p>
            <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              The Four Pillars of Our Success
            </h2>
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible">
              {companyPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex-shrink-0 w-64 sm:w-72 lg:w-auto snap-center group relative text-center bg-gradient-to-br from-white to-[#F7F8FA] rounded-2xl p-6 border border-[#E2E8F0] transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                    style={{ boxShadow: "0 2px 12px rgba(13,34,64,0.06)" }}
                  >
                    <div className="relative mb-4 mx-auto w-20 h-20">
                      <div
                        className="absolute inset-0 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                        style={{ background: "linear-gradient(135deg, rgba(10,138,120,0.18) 0%, rgba(13,34,64,0.1) 100%)" }}
                      />
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Icon size={36} className="text-[#0A8A78] transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <div
                      className="text-4xl font-bold text-[#0D2240] mb-2 transition-all duration-300 group-hover:text-[#0A8A78] group-hover:scale-110"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {pillar.stat}
                    </div>
                    <h3 className="text-[#0D2240] mb-2 group-hover:text-[#0A8A78] transition-colors" style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
          </div>
        </div>
      </section>

      <SectionDivider className="bg-white" />

      {/* ── Core Values ── */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-[#F7F8FA] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Our Core Values
            </p>
            <h2 className="text-[#0D2240] mb-3" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              What Drives Us Forward
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "0.95rem" }}>
              Understanding our mission, vision, and goals helps you know what drives us forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value, idx) => {
              return (
                <div
                  key={value.title}
                  className="group relative bg-white rounded-2xl p-8 border border-[#E2E8F0] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                  style={{
                    boxShadow: "0 4px 16px rgba(13,34,64,0.08)",
                    animation: `scale-in 0.6s ease-out ${idx * 0.1}s both`,
                  }}
                >
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(10,138,120,0.30)",
                      boxShadow: "0 8px 24px rgba(13,34,64,0.12)",
                    }}
                  >
                    <Image
                      src={value.iconSrc}
                      alt={value.title}
                      width={30}
                      height={30}
                      className="w-[30px] h-[30px] object-contain"
                    />
                  </div>
                  <div className="mt-6">
                    <h3
                      className="text-[#0D2240] mb-3 text-center group-hover:text-[#0A8A78] transition-all duration-300"
                      style={{ fontSize: "1.2rem", fontWeight: 700 }}
                    >
                      {value.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed text-center transition-colors duration-300 group-hover:text-slate-700">
                      {value.description}
                    </p>
                  </div>
                  {/* Subtle shine effect on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, transparent 0%, rgba(10,138,120,0.05) 50%, transparent 100%)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider className="bg-white" />

      {/* ── Testimonials ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Client Testimonials
            </p>
            <h2 className="text-[#0D2240] mb-2" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto" style={{ fontSize: "0.95rem" }}>
              See what our global partners say about working with Nexlife International
            </p>
          </div>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      <SectionDivider className="bg-white" />

      {/* ── Company showcase ── */}
      <section className="py-16 lg:py-20 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Who We Are
          </p>
          <h2
            className="text-[#0D2240] mb-4"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}
          >
            Your Trusted Partner in Surgical &amp; Medical Supplies
          </h2>
          <p className="text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto" style={{ fontSize: "0.97rem" }}>
            Nexlife International delivers FDA-registered, ISO 13485 certified surgical instruments
            and medical disposables to healthcare providers across more than 40 countries. From bulk
            procurement to dependable global logistics, we make quality healthcare accessible everywhere.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            {[
              { src: "/ICONS/quality-assurance.png", label: "Quality Assured" },
              { src: "/ICONS/certificate.png", label: "Certified" },
              { src: "/ICONS/container.png", label: "Global Logistics" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(10,138,120,0.12)" }}
                >
                  <Image src={item.src} alt={item.label} width={26} height={26} className="w-[26px] h-[26px] object-contain" />
                </div>
                <span className="text-xs text-slate-600" style={{ fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm text-white transition-all duration-150 active:scale-95"
            style={{ backgroundColor: "#0A8A78", fontWeight: 600, boxShadow: "0 2px 8px rgba(10,138,120,0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
          >
            Learn More About Us
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      <SectionDivider className="bg-white" />

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
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-sm text-white transition-all duration-150 active:scale-95"
              style={{ backgroundColor: "#0A8A78", fontWeight: 600, boxShadow: "0 2px 8px rgba(10,138,120,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
            >
              Get a Quote
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-sm text-white transition-all duration-150"
              style={{ border: "1px solid rgba(255,255,255,0.25)", fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              About NexLife
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
