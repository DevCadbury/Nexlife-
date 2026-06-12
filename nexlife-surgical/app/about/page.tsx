"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, Award, Users, Globe, TrendingUp } from "lucide-react";

const milestones = [
  { year: "2009", title: "Founded in Surat, India", desc: "Nexlife International established with a mission to provide affordable, high-quality pharmaceutical products to global healthcare markets." },
  { year: "2012", title: "WHO-GMP Certification", desc: "Achieved WHO-GMP certification — our first major quality milestone confirming compliance with global pharmaceutical manufacturing standards." },
  { year: "2015", title: "International Expansion", desc: "Expanded distribution to 25 countries across Asia, Africa, and Middle East with dedicated regional distribution networks." },
  { year: "2018", title: "ISO 9001:2015 Certified", desc: "Obtained ISO 9001:2015 certification, reinforcing our commitment to quality management systems and continuous improvement." },
  { year: "2020", title: "Global Healthcare Partner", desc: "Became a trusted pharmaceutical partner for over 500 healthcare providers worldwide during the global health crisis." },
  { year: "2024", title: "50+ Countries Served", desc: "Reached our current footprint — over 1,000 satisfied clients and a diverse portfolio of 500+ pharmaceutical products." },
];

const teamValues = [
  { icon: Award, title: "Our Mission", desc: "At Nexlife International, our mission is clear: we aim to improve lives by providing affordable, high-quality pharmaceutical solutions to healthcare providers worldwide. We are committed to bridging the gap between pharmaceutical innovation and accessibility." },
  { icon: Users, title: "Our Vision", desc: "At Nexlife International, our vision is to enhance global access to high-quality, affordable pharmaceutical products. We envision a world where quality healthcare is accessible to everyone, regardless of geographical boundaries." },
  { icon: TrendingUp, title: "Our Goal", desc: "At Nexlife International, our overarching goal is to lead the pharmaceutical export industry through innovation, reliability, and customer-centric approaches. We strive to become the most trusted partner in global pharmaceutical trade." },
  { icon: Globe, title: "Global Footprint", desc: "Delivering health across borders. Our products are trusted by healthcare professionals in over 50+ countries including South East Asia, Africa, Latin America, CIS Countries, Middle East, and Europe." },
];

const certifications = [
  "WHO-GMP – World Health Organization Good Manufacturing Practice",
  "ISO 9001:2015 – Quality Management Systems",
  "FSSAI – Food Safety and Standards Authority of India",
  "HACCP – Hazard Analysis and Critical Control Points",
  "Export License – Pharmaceutical Export Authorization",
  "Drug License – Manufacturing & Distribution",
  "CE Marking – European Conformity (Select Products)",
  "GMP Compliance – Good Manufacturing Practice Standards",
];

export default function About() {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section
        className="relative py-20 lg:py-28"
        style={{ backgroundColor: "#0D2240" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(10,138,120,0.14) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[#0A8A78] text-xs mb-3" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Our Story
            </p>
            <h1
              className="text-white mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}
            >
              About Nexlife International
            </h1>
            <p className="text-slate-300 leading-relaxed max-w-xl" style={{ fontSize: "1rem" }}>
              Bridging the gap between quality healthcare and global accessibility. We are a leading pharmaceutical company based in India, committed to providing high-quality, affordable medicines to patients worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-xs text-[#0A8A78] mb-3" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Our Mission
              </p>
              <h2
                className="text-[#0D2240] mb-5"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}
              >
                Who We Are
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4" style={{ fontSize: "0.95rem" }}>
                Nexlife International is a dynamic and rapidly growing pharmaceutical company based in India. We are committed to providing high-quality, affordable medicines to patients worldwide.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6" style={{ fontSize: "0.95rem" }}>
                With a strong focus on innovation and quality compliance, we have established ourselves as a trusted partner for healthcare providers in over 50 countries. Our state-of-the-art manufacturing facilities adhere to strict WHO-GMP guidelines.
              </p>
              <blockquote className="border-l-4 border-[#0A8A78] pl-4 italic text-slate-600 leading-relaxed mb-6" style={{ fontSize: "0.95rem" }}>
                "We believe that healthcare is a fundamental right, not a privilege. That's why we work tirelessly to ensure our diverse portfolio of pharmaceutical products reaches those who need them most."
              </blockquote>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { stat: "50+", label: "Countries" },
                  { stat: "500+", label: "Products" },
                  { stat: "1000+", label: "Happy Clients" },
                  { stat: "15+", label: "Years Experience" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 bg-[#F7F8FA] rounded-lg border border-[#E2E8F0]">
                    <div className="text-3xl font-bold text-[#0A8A78] mb-1" style={{ letterSpacing: "-0.02em" }}>
                      {item.stat}
                    </div>
                    <div className="text-sm text-slate-600">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img
                  src="https://images.unsplash.com/photo-1768498993096-6db9950eeb1b?w=900&q=80&fm=webp"
                  alt="Nexlife supply facility"
                  className="w-full h-full object-cover"
                  width={900}
                  height={675}
                  loading="lazy"
                />
              </div>
              {/* Floating stat card */}
              <div
                className="absolute -bottom-5 -left-5 hidden lg:block rounded-xl p-5 shadow-xl"
                style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", minWidth: "180px" }}
              >
                <div className="text-[#0D2240] mb-0.5" style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em" }}>
                  1,000+
                </div>
                <div className="text-sm text-slate-500">Happy Clients Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 lg:py-20 bg-[#F7F8FA]" style={{ borderTop: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              What We Stand For
            </p>
            <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamValues.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-lg p-6 border border-[#E2E8F0]"
                style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.05)" }}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(10,138,120,0.10)" }}
                >
                  <Icon size={22} className="text-[#0A8A78]" />
                </div>
                <h3 className="text-[#0D2240] mb-2" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Our Journey
            </p>
            <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Two Decades of Growth
            </h2>
          </div>

          <div className="relative">
            <div
              className="absolute left-[3.5rem] top-0 bottom-0 w-px hidden sm:block"
              style={{ backgroundColor: "#E2E8F0" }}
            />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6 items-start">
                  <div
                    className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-xs z-10"
                    style={{
                      backgroundColor: i === milestones.length - 1 ? "#0A8A78" : "#F7F8FA",
                      border: `2px solid ${i === milestones.length - 1 ? "#0A8A78" : "#E2E8F0"}`,
                      color: i === milestones.length - 1 ? "#fff" : "#0D2240",
                      fontWeight: 700,
                    }}
                  >
                    {m.year}
                  </div>
                  <div
                    className="flex-1 rounded-lg p-5 border border-[#E2E8F0]"
                    style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.05)" }}
                  >
                    <h3 className="text-[#0D2240] mb-1" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{m.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="py-16 lg:py-20 bg-[#F7F8FA]" style={{ borderTop: "1px solid #E2E8F0" }} id="certifications">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-[#0A8A78] mb-3" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Compliance & Standards
              </p>
              <h2
                className="text-[#0D2240] mb-5"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}
              >
                Built on a Foundation of Certification
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8" style={{ fontSize: "0.95rem" }}>
                Our compliance framework meets the strictest international standards, giving procurement teams confidence that every Nexlife product is fully validated and audit-ready.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm text-white transition-all duration-150"
                style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
              >
                Request Compliance Documents
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-[#E2E8F0]"
                  style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.04)" }}
                >
                  <CheckCircle2 size={17} className="text-[#0A8A78] flex-shrink-0" />
                  <span className="text-sm text-slate-700">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team imagery ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Ready to Partner?
            </p>
            <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Interested in Importing?
            </h2>
            <p className="text-slate-600 mt-3 max-w-xl mx-auto leading-relaxed" style={{ fontSize: "0.95rem" }}>
              Partner with us for reliable pharmaceutical supply. Contact our team today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base text-white transition-all duration-150 hover:shadow-xl active:scale-95"
              style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
            >
              Become a Partner
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base text-[#0D2240] border-2 border-[#0D2240] transition-all duration-150 hover:bg-[#0D2240] hover:text-white"
              style={{ fontWeight: 600 }}
            >
              View Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
