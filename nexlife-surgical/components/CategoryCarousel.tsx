"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

interface CategoryCarouselProps {
  catId: string;
  catName: string;
  href: string;
  images: string[];
  productCount: number;
  /** ms between auto-advance steps (default 2800) */
  interval?: number;
}

/**
 * A client-side category card with an auto-advancing image carousel.
 * Pauses on hover and resumes when the pointer leaves.
 * Used from the Server Component home page so all images arrive pre-fetched.
 */
export function CategoryCarousel({
  catId,
  catName,
  href,
  images,
  productCount,
  interval = 2800,
}: CategoryCarouselProps) {
  const safeImages = images.length > 0 ? images : ["/our-product-bg.png"];
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);

  const advance = useCallback(() => {
    if (safeImages.length <= 1) return;
    setFading(true);
    setTimeout(() => {
      setIdx((prev) => (prev + 1) % safeImages.length);
      setFading(false);
    }, 350);
  }, [safeImages.length]);

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!pausedRef.current) advance();
    }, interval);
  }, [advance, interval]);

  // Auto-advance
  useEffect(() => {
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, scheduleNext]);

  // Each card staggers so all cards don't flip simultaneously
  useEffect(() => {
    const stagger = Math.floor(Math.random() * interval);
    const t = setTimeout(scheduleNext, stagger);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = () => { pausedRef.current = true; };
  const resume = () => {
    pausedRef.current = false;
    scheduleNext();
  };

  const src = safeImages[idx];

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl bg-white border border-[#E2E8F0] flex flex-col"
      style={{ boxShadow: "0 2px 8px rgba(13,34,64,0.08)", transition: "box-shadow 300ms, transform 300ms, border-color 300ms" }}
      onMouseEnter={(e) => {
        pause();
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(13,34,64,0.14)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(10,138,120,0.25)";
      }}
      onMouseLeave={(e) => {
        resume();
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(13,34,64,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
    >
      {/* Product count badge */}
      <div className="absolute top-3 left-3 z-10">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "rgba(13,34,64,0.82)", boxShadow: "0 2px 8px rgba(13,34,64,0.25)" }}
        >
          <span className="text-xs text-white/90 font-semibold">{productCount} Products</span>
        </div>
      </div>

      {/* Image area */}
      <div className="relative overflow-hidden bg-white" style={{ height: "270px", flexShrink: 0 }}>
        {/* Current image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={src}
          src={src}
          alt={catName}
          className="absolute inset-0 w-full h-full object-contain p-4"
          style={{
            opacity: fading ? 0 : 1,
            transition: "opacity 0.35s ease, transform 0.5s ease",
            transform: fading ? "scale(0.97)" : "scale(1)",
          }}
          loading="lazy"
          decoding="async"
        />

        {/* Dot indicators removed — clean look */}
      </div>

      {/* Label */}
      <div className="px-5 py-4 bg-white" style={{ transition: "background-color 300ms" }}>
        <h3
          className="text-[#0D2240] group-hover:text-[#0A8A78] transition-colors"
          style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          {catName}
        </h3>
      </div>
    </Link>
  );
}
