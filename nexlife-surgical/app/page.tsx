// Server Component — no "use client". Fetches all data on the server (ISR,
// revalidated every 60s) so the browser receives pre-populated HTML immediately.
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { SectionDivider } from "@/components/SectionDivider";
import { HomeClient } from "@/components/HomeClient";
import {
  serverGetCategories,
  serverGetFeaturedProducts,
  serverGetStarredProducts,
  serverGetAllProducts,
} from "@/lib/api.server";

export const revalidate = 60; // ISR — regenerate at most once per minute

// ─── Static sections ─────────────────────────────────────────────────────────
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
    description:
      "Your satisfaction is our top priority. We aim to exceed your expectations with every interaction and delivery.",
  },
  {
    iconSrc: "/ICONS/transportation.png",
    title: "Supply Chain Reliability",
    description:
      "Timeliness is critical in the pharmaceutical industry. We ensure reliable and consistent supply chain management.",
  },
  {
    iconSrc: "/ICONS/best-product.png",
    title: "Competitive Pricing",
    description:
      "We offer competitive and affordable pricing without compromising on quality or service standards.",
  },
  {
    iconSrc: "/ICONS/internet.png",
    title: "Global Reach",
    description:
      "Delivering quality healthcare products across borders to over 50+ countries worldwide.",
  },
];

const coreValues = [
  {
    iconSrc: "/ICONS/focus.png",
    title: "Our Mission",
    description:
      "At Nexlife International, our mission is clear: we aim to improve lives by providing affordable, high-quality pharmaceutical solutions to healthcare providers worldwide. We are committed to bridging the gap between pharmaceutical innovation and accessibility.",
  },
  {
    iconSrc: "/ICONS/future.png",
    title: "Our Vision",
    description:
      "At Nexlife International, our vision is to enhance global access to high-quality, affordable pharmaceutical products. We envision a world where quality healthcare is accessible to everyone, regardless of geographical boundaries.",
  },
  {
    iconSrc: "/ICONS/goal.png",
    title: "Our Goal",
    description:
      "At Nexlife International, our overarching goal is to lead the pharmaceutical export industry through innovation, reliability, and customer-centric approaches. We strive to become the most trusted partner in global pharmaceutical trade.",
  },
];

const companyPillars = [
  { icon: "Users", title: "EMPLOYEE'S", description: "Our dedicated team of professionals", stat: "100+" },
  { icon: "Heart", title: "MEDICINE", description: "Quality pharmaceutical products", stat: "500+" },
  { icon: "Building2", title: "CUSTOMERS", description: "Customer satisfaction first", stat: "1000+" },
  { icon: "Globe", title: "COUNTRIES", description: "Global presence worldwide", stat: "50+" },
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

// ─── Server Component (data fetching) ────────────────────────────────────────

export default async function Home() {
  // All four fetches run in parallel on the server — browser gets data-filled HTML
  const [categoriesRes, featuredRes, starredRes, allProductsRes] = await Promise.all([
    serverGetCategories("surgical"),
    serverGetFeaturedProducts("surgical"),
    serverGetStarredProducts("surgical"),
    serverGetAllProducts("surgical", 80),
  ]);

  const apiCategories = categoriesRes?.items ?? [];
  const featuredProducts = featuredRes?.items ?? [];
  const starredProducts = starredRes?.items ?? [];
  const apiAllProducts = allProductsRes?.items ?? [];

  const catIdToName = new Map(apiCategories.map((c) => [c._id, c.name]));
  const resolveCategory = (raw: string): string => {
    if (!raw) return "";
    if (/^[a-f0-9]{24}$/i.test(raw)) return catIdToName.get(raw) ?? raw;
    return raw;
  };

  const visibleCategories = apiCategories
    .filter((c) => c.visible && !/^[a-f0-9]{24}$/i.test(c.name))
    .slice(0, 6);

  return (
    <div>
      {/* ── Hero + carousel (client interactive) ── */}
      <HomeClient />

      <SectionDivider className="bg-white" />

      {/* ── Stats banner (static server-rendered) ── */}
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

      {/* ── Categories (server-rendered, data already here) ── */}
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
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-[#0A8A78] hover:underline shrink-0" style={{ fontWeight: 500 }}>
              View all products <ArrowRight size={14} />
            </Link>
          </div>

          {visibleCategories.length === 0 ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center">
              <p className="text-sm text-slate-400">No categories available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCategories.map((cat) => {
                const categoryProducts = apiAllProducts
                  .filter((p) => resolveCategory(p.category) === cat.name)
                  .slice(0, 6);
                const carouselImages = categoryProducts
                  .map((p) => p.images[0]?.secure_url)
                  .filter(Boolean) as string[];
                const firstImage = carouselImages[0] ?? "/our-product-bg.png";
                const productCount = apiAllProducts.filter((p) => resolveCategory(p.category) === cat.name).length;

                return (
                  <Link
                    key={cat._id}
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="group relative overflow-hidden rounded-xl bg-white border border-[#E2E8F0] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[#0A8A78]/20"
                    style={{ boxShadow: "0 2px 8px rgba(13,34,64,0.08)" }}
                  >
                    <div className="absolute top-3 left-3 z-10">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 group-hover:scale-105"
                        style={{ backgroundColor: "rgba(13,34,64,0.85)", boxShadow: "0 2px 8px rgba(13,34,64,0.3)" }}
                      >
                        <span className="text-xs text-white/90 font-semibold">{productCount} Products</span>
                      </div>
                    </div>
                    <div className="relative overflow-hidden bg-white" style={{ height: "280px" }}>
                      <Image
                        src={firstImage}
                        alt={cat.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                      />
                    </div>
                    <div className="px-5 py-4 bg-white group-hover:bg-[#F7F8FA] transition-colors duration-300">
                      <h3 className="text-[#0D2240] group-hover:text-[#0A8A78] transition-colors" style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
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
      {starredProducts.length > 0 && (
        <>
          <section className="py-16 lg:py-20 bg-[#F7F8FA]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div>
                  <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Ready to Order</p>
                  <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
                    Featured / Order Products
                  </h2>
                </div>
                <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-[#0A8A78] hover:underline shrink-0" style={{ fontWeight: 500 }}>
                  View all products <ArrowRight size={14} />
                </Link>
              </div>
              {/* ProductCarousel needs client interactivity — pass pre-fetched data */}
              <ProductCarouselWrapper products={starredProducts} />
            </div>
          </section>
          <SectionDivider className="bg-white" />
        </>
      )}

      {/* ── Featured Products ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Top Sellers</p>
              <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
                Featured Products
              </h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-[#0A8A78] hover:underline shrink-0" style={{ fontWeight: 500 }}>
              See all products <ArrowRight size={14} />
            </Link>
          </div>
          {featuredProducts.length === 0 ? (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F7F8FA] p-8 text-center">
              <p className="text-sm text-slate-400">No featured products available.</p>
            </div>
          ) : (
            <ProductCarouselWrapper products={featuredProducts} />
          )}
        </div>
      </section>

      <SectionDivider className="bg-[#F7F8FA]" />

      {/* ── Why Choose Us ── */}
      <section className="py-16 lg:py-20 bg-[#F7F8FA]" style={{ borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Why Choose Us?</p>
            <h2 className="text-[#0D2240] mb-3" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Excellence in Every Aspect
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "0.95rem" }}>
              We are committed to delivering excellence in every aspect of our pharmaceutical services.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feat, idx) => (
              <div
                key={feat.title}
                className="group bg-white rounded-xl p-6 border border-[#E2E8F0] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#0A8A78]/30"
                style={{ boxShadow: "0 2px 8px rgba(13,34,64,0.06)" }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "rgba(10,138,120,0.12)" }}>
                  <Image src={feat.iconSrc} alt={feat.title} width={30} height={30} className="w-[30px] h-[30px] object-contain" />
                </div>
                <h3 className="text-[#0D2240] mb-2 group-hover:text-[#0A8A78] transition-colors duration-300" style={{ fontSize: "1rem", fontWeight: 700 }}>
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider className="bg-white" />

      {/* ── Company Pillars ── */}
      <CompanyPillarsSection pillars={companyPillars} />

      <SectionDivider className="bg-white" />

      {/* ── Core Values ── */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-[#F7F8FA] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Core Values</p>
            <h2 className="text-[#0D2240] mb-3" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              What Drives Us Forward
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "0.95rem" }}>
              Understanding our mission, vision, and goals helps you know what drives us forward.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value, idx) => (
              <div
                key={value.title}
                className="group relative bg-white rounded-2xl p-8 border border-[#E2E8F0] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                style={{ boxShadow: "0 4px 16px rgba(13,34,64,0.08)" }}
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: "#ffffff", border: "1px solid rgba(10,138,120,0.30)", boxShadow: "0 8px 24px rgba(13,34,64,0.12)" }}
                >
                  <Image src={value.iconSrc} alt={value.title} width={30} height={30} className="w-[30px] h-[30px] object-contain" />
                </div>
                <div className="mt-6">
                  <h3 className="text-[#0D2240] mb-3 text-center group-hover:text-[#0A8A78] transition-all duration-300" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                    {value.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed text-center">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider className="bg-white" />

      {/* ── Testimonials (client carousel) ── */}
      <TestimonialsWrapper testimonials={testimonials} />

      <SectionDivider className="bg-white" />

      {/* ── Who We Are ── */}
      <section className="py-16 lg:py-20 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Who We Are</p>
          <h2 className="text-[#0D2240] mb-4" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Your Trusted Partner in Surgical &amp; Medical Supplies
          </h2>
          <p className="text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto" style={{ fontSize: "0.97rem" }}>
            Nexlife International delivers FDA-registered, ISO 13485 certified surgical instruments and medical disposables to healthcare providers across more than 40 countries. From bulk procurement to dependable global logistics, we make quality healthcare accessible everywhere.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            {[
              { src: "/ICONS/quality-assurance.png", label: "Quality Assured" },
              { src: "/ICONS/certificate.png", label: "Certified" },
              { src: "/ICONS/container.png", label: "Global Logistics" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(10,138,120,0.12)" }}>
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
          >
            Learn More About Us
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      <SectionDivider className="bg-white" />

      {/* ── CTA Banner ── */}
      <section className="py-16 relative overflow-hidden" style={{ backgroundColor: "#0D2240" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(10,138,120,0.18) 0%, transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#0A8A78] text-xs mb-3" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Ready to Partner?</p>
          <h2 className="text-white mb-4" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
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
            >
              Get a Quote <ArrowRight size={15} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-sm text-white transition-all duration-150"
              style={{ border: "1px solid rgba(255,255,255,0.25)", fontWeight: 500 }}
            >
              About Nexlife International
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Thin client wrappers for interactive sections ──────────────────────────
// These are imported here to keep RSC boundaries explicit.
import { ProductCarouselWrapper } from "@/components/ProductCarouselWrapper";
import { CompanyPillarsSection } from "@/components/CompanyPillarsSection";
import { TestimonialsWrapper } from "@/components/TestimonialsWrapper";
