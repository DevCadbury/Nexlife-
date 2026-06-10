"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  location: string;
  text: string;
  rating: number;
  avatar?: string;
  date?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (!isHovered && testimonials.length > itemsPerView) {
      intervalRef.current = setInterval(goToNext, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, currentIndex, testimonials.length, itemsPerView]);

  return (
    <div
      className="relative"
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
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <div
                className="relative bg-white rounded-xl p-6 border border-[#E2E8F0] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                style={{
                  boxShadow: "0 2px 12px rgba(13,34,64,0.06)",
                }}
              >
                {/* Google-style review header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${getGradientColor(testimonial.name)} 0%, ${getGradientColor(testimonial.name, true)} 100%)`,
                    }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#0D2240] truncate" style={{ fontSize: "0.95rem" }}>
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{testimonial.role}</p>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < testimonial.rating ? "#F59E0B" : "none"}
                      className={i < testimonial.rating ? "text-amber-400" : "text-slate-300"}
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-slate-700 leading-relaxed mb-4 text-sm line-clamp-4">
                  {testimonial.text}
                </p>

                {/* Company info */}
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <p className="text-xs text-slate-600 truncate">{testimonial.company}</p>
                  <p className="text-xs text-[#0A8A78] mt-0.5">{testimonial.location}</p>
                </div>

                {/* Quote decoration */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote size={32} className="text-[#0A8A78]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {testimonials.length > itemsPerView && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-14 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
            style={{ backgroundColor: "#0A8A78", boxShadow: "0 4px 12px rgba(10,138,120,0.3)" }}
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-14 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
            style={{ backgroundColor: "#0A8A78", boxShadow: "0 4px 12px rgba(10,138,120,0.3)" }}
            aria-label="Next testimonials"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="transition-all duration-300"
            style={{
              width: idx === currentIndex ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              backgroundColor: idx === currentIndex ? "#0A8A78" : "#E2E8F0",
            }}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function getGradientColor(name: string, secondary = false): string {
  const colors = [
    ["#0A8A78", "#067563"],
    ["#3B82F6", "#2563EB"],
    ["#8B5CF6", "#7C3AED"],
    ["#EC4899", "#DB2777"],
    ["#F59E0B", "#D97706"],
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorPair = colors[hash % colors.length];
  return secondary ? colorPair[1] : colorPair[0];
}
