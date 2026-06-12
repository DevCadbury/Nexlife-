"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Linkedin, Twitter, Facebook, ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/lib/hooks/useCategories";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Shopping Cart", href: "/cart" },
  { label: "Quality Certifications", href: "/about#certifications" },
];

// Fallback categories shown only if the CRM has none configured yet.
const fallbackCategories = [
  { label: "Surgical Instruments", href: "/products?category=surgical-instruments" },
  { label: "Disposable Gloves", href: "/products?category=disposable-gloves" },
  { label: "Face Masks & Respirators", href: "/products?category=face-masks-respirators" },
  { label: "Syringes & Needles", href: "/products?category=syringes-needles" },
  { label: "Wound Care", href: "/products?category=wound-care" },
  { label: "Protective Apparel", href: "/products?category=protective-apparel" },
];

// Social Icon Component
function SocialIcon({ Icon, label, href }: { Icon: any; label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 transition-all duration-200 hover:text-white hover:bg-[#0A8A78] hover:border-[#0A8A78]"
      style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)"
      }}
    >
      <Icon size={16} />
    </a>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subMsg, setSubMsg] = useState("");
  const { data: categoriesData } = useCategories("surgical");

  // Build the Products column from live CRM categories (visible, non-ObjectId names).
  const dynamicCategories = (categoriesData?.items ?? [])
    .filter((c) => c.visible && !/^[a-f0-9]{24}$/i.test(c.name))
    .map((c) => ({ label: c.name, href: `/products?category=${encodeURIComponent(c.name)}` }));
  const productCategories = dynamicCategories.length ? dynamicCategories : fallbackCategories;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subState === "loading") return;
    setSubState("loading");
    setSubMsg("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "surgical" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Subscription failed. Please try again.");
      setSubState("success");
      setSubMsg(data?.message || "Subscribed! Check your inbox for a confirmation email.");
      setEmail("");
    } catch (err: unknown) {
      setSubState("error");
      setSubMsg(err instanceof Error ? err.message : "Subscription failed. Please try again.");
    }
  };

  return (
    <footer className="relative">
      {/* Newsletter Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A8A78] via-[#087868] to-[#0A8A78]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 80%, white 2px, transparent 2px)",
            backgroundSize: "60px 60px"
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs text-white font-semibold tracking-wide">STAY CONNECTED</span>
              </div>
              <h3 className="text-white mb-3" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Get Industry Insights
              </h3>
              <p className="text-white/90 text-sm leading-relaxed max-w-md">
                Subscribe to receive product updates, industry news, and exclusive offers directly to your inbox.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={subState === "loading"}
                  className="flex-1 text-sm text-[#0D2240] rounded-lg px-4 py-3.5 outline-none placeholder-slate-400 border-2 border-transparent focus:border-white/30 transition-all disabled:opacity-70"
                  style={{ backgroundColor: "white" }}
                />
                <button
                  type="submit"
                  disabled={subState === "loading"}
                  className="px-6 py-3.5 rounded-lg text-sm text-white flex items-center justify-center gap-2 transition-all hover:shadow-2xl active:scale-95 whitespace-nowrap hover:bg-[#0D2240]/90 disabled:opacity-70"
                  style={{ backgroundColor: "#0D2240", fontWeight: 600 }}
                >
                  <Send size={16} />
                  {subState === "loading" ? "Subscribing…" : "Subscribe Now"}
                </button>
              </div>
              {subMsg && (
                <p
                  className="text-sm"
                  style={{ color: subState === "error" ? "#FECACA" : "#ffffff", fontWeight: 500 }}
                >
                  {subState === "success" ? "✓ " : ""}{subMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-gradient-to-b from-[#0D2240] to-[#081829]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Mobile Layout: Logo + Quick Info */}
          <div className="lg:hidden">
            <div className="flex flex-col items-center text-center mb-8">
              <img
                src="/images/nexlife-logo.png"
                alt="Nexlife International"
                className="h-16 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-md">
                Leading pharmaceutical import & export solutions worldwide. Innovating healthcare, improving lives.
              </p>
              <div className="flex items-center gap-3 mb-6">
                <SocialIcon Icon={Linkedin} label="LinkedIn" href="#" />
                <SocialIcon Icon={Twitter} label="Twitter" href="#" />
                <SocialIcon Icon={Facebook} label="Facebook" href="#" />
              </div>
            </div>

            {/* Mobile: Two Column Layout */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Left: Quick Links */}
              <div>
                <h4 className="text-white text-sm mb-4 font-semibold">Quick Links</h4>
                <ul className="space-y-2">
                  {quickLinks.slice(0, 4).map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-xs text-slate-400 hover:text-[#0A8A78] transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Contact */}
              <div>
                <h4 className="text-white text-sm mb-4 font-semibold">Contact</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="mailto:Info@nexlifeinternational.com" className="text-xs text-slate-400 hover:text-[#0A8A78] transition-colors block">
                      Info@nexlifeinternational.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:+919664843790" className="text-xs text-slate-400 hover:text-[#0A8A78] transition-colors block">
                      +91 96648 43790
                    </a>
                  </li>
                  <li>
                    <a href="tel:+918401546910" className="text-xs text-slate-400 hover:text-[#0A8A78] transition-colors block">
                      +91 84015 46910
                    </a>
                  </li>
                  <li className="text-xs text-slate-500 leading-relaxed">
                    Surat, Gujarat, India
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-4 gap-10">
            {/* Brand column */}
            <div>
              <img
                src="/images/nexlife-logo.png"
                alt="Nexlife International"
                className="h-12 w-auto mb-5 brightness-0 invert"
              />
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Leading pharmaceutical import & export solutions worldwide. Innovating healthcare, improving lives.
              </p>
              <div className="flex items-center gap-3">
                <SocialIcon Icon={Linkedin} label="LinkedIn" href="#" />
                <SocialIcon Icon={Twitter} label="Twitter" href="#" />
                <SocialIcon Icon={Facebook} label="Facebook" href="#" />
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white text-sm mb-5 flex items-center gap-2" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
                <ArrowRight size={16} className="text-[#0A8A78]" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-[#0A8A78] transition-colors duration-150 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#0A8A78] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product categories */}
            <div>
              <h4 className="text-white text-sm mb-5 flex items-center gap-2" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
                <ArrowRight size={16} className="text-[#0A8A78]" />
                Products
              </h4>
              <ul className="space-y-3">
                {productCategories.slice(0, 5).map((cat) => (
                  <li key={cat.label}>
                    <Link
                      href={cat.href}
                      className="text-sm text-slate-400 hover:text-[#0A8A78] transition-colors duration-150 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#0A8A78] transition-colors" />
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="text-white text-sm mb-5 flex items-center gap-2" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
                <ArrowRight size={16} className="text-[#0A8A78]" />
                Contact
              </h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:Info@nexlifeinternational.com" className="flex items-start gap-3 text-sm text-slate-400 hover:text-[#0A8A78] transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(10,138,120,0.1)" }}>
                      <Mail size={14} className="text-[#0A8A78]" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Email</div>
                      Info@nexlifeinternational.com
                    </div>
                  </a>
                </li>
                <li>
                  <a href="tel:+919664843790" className="flex items-start gap-3 text-sm text-slate-400 hover:text-[#0A8A78] transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(10,138,120,0.1)" }}>
                      <Phone size={14} className="text-[#0A8A78]" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Phone</div>
                      +91 96648 43790<br />+91 84015 46910
                    </div>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-sm text-slate-400">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgba(10,138,120,0.1)" }}>
                      <MapPin size={14} className="text-[#0A8A78]" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Location</div>
                      Surat, Gujarat, India
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#050F1C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 text-center md:text-left">
              © {new Date().getFullYear()} Nexlife International. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4 text-xs">
              {[
                { label: "WHO-GMP", icon: true },
                { label: "ISO 9001:2015", icon: true },
                { label: "Privacy Policy", icon: false },
                { label: "Terms of Service", icon: false },
              ].map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5 text-slate-500">
                  {item.icon && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A8A78]" />
                  )}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
