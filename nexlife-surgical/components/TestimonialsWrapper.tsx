"use client";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  location: string;
  text: string;
  rating: number;
}

export function TestimonialsWrapper({ testimonials }: { testimonials: Testimonial[] }) {
  return (
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
  );
}
