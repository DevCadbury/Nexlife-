import { Link } from "react-router";
import { CheckCircle2, ArrowRight, Award, Users, Globe, TrendingUp } from "lucide-react";

const milestones = [
  { year: "2004", title: "Founded in Houston, TX", desc: "Nexlife International established with a mission to supply premium surgical disposables to emerging healthcare markets." },
  { year: "2008", title: "ISO 13485 Certification", desc: "Achieved ISO 13485 certification — our first major quality milestone confirming compliance with global medical device standards." },
  { year: "2012", title: "FDA Registration", desc: "Registered with the U.S. FDA as a medical device establishment, opening the path to supply U.S. hospitals and healthcare networks." },
  { year: "2016", title: "Global Expansion", desc: "Expanded distribution to 25 countries across Europe, Asia-Pacific, and the Middle East with dedicated regional account teams." },
  { year: "2020", title: "COVID-19 Response", desc: "Scaled production and logistics to supply 500+ hospitals with PPE during the pandemic, maintaining 98%+ delivery reliability." },
  { year: "2024", title: "40+ Countries Served", desc: "Reached our current footprint — over 2,500 hospital partners and a full catalog of 300+ certified medical products." },
];

const teamValues = [
  { icon: Award, title: "Uncompromising Quality", desc: "Every product meets or exceeds FDA, ISO, and CE requirements. We never trade safety for cost." },
  { icon: Users, title: "Patient-First Culture", desc: "From warehouse staff to account managers, every team member understands the impact of what we ship on patient outcomes." },
  { icon: Globe, title: "Global Responsibility", desc: "We work with ethical manufacturers and maintain transparent supply chains audited annually by independent third parties." },
  { icon: TrendingUp, title: "Continuous Improvement", desc: "We invest in R&D and QMS upgrades annually, maintaining the highest product and process standards across our catalog." },
];

const certifications = [
  "ISO 13485:2016 – Medical Devices Quality Management",
  "FDA Registered Establishment (Reg. No. 3014826347)",
  "CE Marking – Medical Device Directive 93/42/EEC",
  "ASTM F2100 – Standard for Medical Face Masks",
  "NIOSH Approval – N95 Respiratory Protection",
  "EN 455 – Medical Gloves for Single Use",
  "AAMI PB70 – Protective Apparel Standards",
  "ISO 11135 – EO Sterilization Validation",
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
              Twenty Years of Medical Excellence
            </h1>
            <p className="text-slate-300 leading-relaxed max-w-xl" style={{ fontSize: "1rem" }}>
              From a single Houston warehouse to a global network serving 40+ countries — Nexlife International exists for one reason: to ensure every clinician has the safest, highest-quality disposable and surgical products possible.
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
                Precision Supply for Critical Care
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4" style={{ fontSize: "0.95rem" }}>
                At Nexlife International, we believe that the quality of medical supplies directly impacts patient safety. Our mission is to be the most trusted, efficient, and transparent supplier in the medical disposables and surgical instruments industry.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6" style={{ fontSize: "0.95rem" }}>
                We achieve this by rigorously qualifying every manufacturing partner, maintaining our own quality management system, and building long-term relationships with the hospitals and distributors who rely on us.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Strict multi-stage quality inspection for every product line",
                  "100% traceability from raw material to end-user delivery",
                  "Dedicated regulatory affairs team for compliance across 40+ markets",
                  "Annual third-party audits of all manufacturing facilities",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-[#0A8A78] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
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
                  2,500+
                </div>
                <div className="text-sm text-slate-500">Hospital Partners Worldwide</div>
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
                to="/contact"
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
              Our Team & Facilities
            </p>
            <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              People Who Care About Every Product
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { src: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=700&q=80&fm=webp", alt: "Nexlife Quality Team" },
              { src: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=700&q=80&fm=webp", alt: "Nexlife Lab Facility" },
              { src: "https://images.unsplash.com/photo-1766297247072-93fd815afef3?w=700&q=80&fm=webp", alt: "Nexlife Distribution Center" },
            ].map(({ src, alt }) => (
              <div key={alt} className="rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover"
                  width={700}
                  height={525}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
