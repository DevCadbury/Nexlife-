"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";

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

export function HomeClient() {
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

  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentSlide]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 6000);
  };

  return (
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
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(105deg, rgba(8,24,41,0.82) 0%, rgba(8,24,41,0.45) 55%, rgba(8,24,41,0.2) 100%)" }}
          />
        </div>
      ))}

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

      {/* Dot controls */}
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
              padding: "8px",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
