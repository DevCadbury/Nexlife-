"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  height?: string;
}

export function ImageCarousel({
  images,
  alt,
  autoPlay = true,
  interval = 3000,
  className = "",
  height = "100%",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setTimeout(() => setIsTransitioning(false), 600);
    }, interval);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, autoPlay, interval, images.length]);

  if (images.length === 0) return null;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-600 ease-in-out"
          style={{
            opacity: i === currentIndex ? 1 : 0,
            zIndex: i === currentIndex ? 1 : 0,
          }}
        >
          <Image
            src={img}
            alt={`${alt} ${i + 1}`}
            className="w-full h-full object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, i) => (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                width: i === currentIndex ? "16px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor: i === currentIndex ? "rgba(10,138,120,0.9)" : "rgba(255,255,255,0.6)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
