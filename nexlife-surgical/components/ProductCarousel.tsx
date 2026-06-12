"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types/product";

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(4);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (!isHovered && products.length > itemsPerView) {
      intervalRef.current = setInterval(goToNext, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, currentIndex, products.length, itemsPerView]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {products.map((product) => {
            const displayName = product.name.replace(/^[a-f0-9]{24}/i, "").trim() || product.name;
            const displayCat = /^[a-f0-9]{24}$/i.test(product.category) ? "" : product.category;
            return (
            <div
              key={product._id}
              className="flex-shrink-0 px-2.5"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <Link
                href={`/product/${product.slug ?? product._id}`}
                className="group relative flex flex-col bg-white rounded-lg border border-[#E2E8F0] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] touch-manipulation h-full"
                style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.06)" }}
              >
                <div className="relative overflow-hidden bg-[#F7F8FA]" style={{ height: "200px" }}>
                  {product.images[0]?.secure_url ? (
                  <Image
                    src={product.images[0].secure_url}
                    alt={displayName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F0F2F5]">
                      <img
                        src="/images/nexlife-logo.png"
                        alt="Nexlife International"
                        style={{ height: "40px", width: "auto", opacity: 0.22, filter: "grayscale(1)" }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-4">
                  {displayCat && (
                    <p className="text-xs text-[#0A8A78] mb-1" style={{ fontWeight: 500 }}>
                      {displayCat}
                    </p>
                  )}
                  <h3
                    className="text-[#0D2240] mb-3 leading-tight"
                    style={{ fontSize: "0.9rem", fontWeight: 600 }}
                  >
                    {displayName}
                  </h3>
                  <div className="mt-auto flex items-end justify-between gap-2">
                    {product.price && !product.hidePrice ? (
                      <div>
                        <div className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1rem" }}>
                          {product.price}
                        </div>
                        {product.priceUnit && (
                          <div className="text-xs text-slate-400">{product.priceUnit}</div>
                        )}
                      </div>
                    ) : (
                      <div />
                    )}
                    <div
                      className="px-3 py-2 rounded text-xs text-white"
                      style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
                    >
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            );
          })}
        </div>
      </div>

      {products.length > itemsPerView && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
            style={{ backgroundColor: "rgba(13,34,64,0.75)", border: "1px solid rgba(255,255,255,0.2)" }}
            aria-label="Previous products"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
            style={{ backgroundColor: "rgba(13,34,64,0.75)", border: "1px solid rgba(255,255,255,0.2)" }}
            aria-label="Next products"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}
