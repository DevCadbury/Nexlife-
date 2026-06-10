import { Link } from "react-router";
import { Phone, Mail, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Get a Quote", href: "/contact" },
  { label: "Quality Certifications", href: "/about#certifications" },
];

const productCategories = [
  { label: "Surgical Instruments", href: "/products?category=surgical-instruments" },
  { label: "Disposable Gloves", href: "/products?category=disposable-gloves" },
  { label: "Face Masks & Respirators", href: "/products?category=face-masks-respirators" },
  { label: "Syringes & Needles", href: "/products?category=syringes-needles" },
  { label: "Wound Care", href: "/products?category=wound-care" },
  { label: "Protective Apparel", href: "/products?category=protective-apparel" },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #E2E8F0" }}>
      {/* Main footer */}
      <div className="bg-[#0D2240]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: "#0A8A78", fontWeight: 700 }}
                >
                  N
                </div>
                <span className="text-white" style={{ fontWeight: 700, fontSize: "15px" }}>
                  NexLife International
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                A global supplier of premium surgical and disposable medical products. Trusted by hospitals, clinics, and healthcare systems in over 40 countries.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: Linkedin, label: "LinkedIn" },
                  { Icon: Twitter, label: "Twitter" },
                  { Icon: Facebook, label: "Facebook" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-150"
                    style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0A8A78")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white text-sm mb-5" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product categories */}
            <div>
              <h4 className="text-white text-sm mb-5" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
                Product Categories
              </h4>
              <ul className="space-y-2.5">
                {productCategories.map((cat) => (
                  <li key={cat.label}>
                    <Link
                      to={cat.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & newsletter */}
            <div>
              <h4 className="text-white text-sm mb-5" style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
                Contact Us
              </h4>
              <ul className="space-y-3 mb-6">
                <li>
                  <a href="tel:+18006395433" className="flex items-start gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                    <Phone size={14} className="mt-0.5 flex-shrink-0 text-[#0A8A78]" />
                    +1 (800) 639-5433
                  </a>
                </li>
                <li>
                  <a href="mailto:sales@nexlifeinternational.com" className="flex items-start gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                    <Mail size={14} className="mt-0.5 flex-shrink-0 text-[#0A8A78]" />
                    sales@nexlifeinternational.com
                  </a>
                </li>
                <li>
                  <span className="flex items-start gap-2.5 text-sm text-slate-400">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#0A8A78]" />
                    <span>1240 Medical Park Drive,<br />Houston, TX 77030, USA</span>
                  </span>
                </li>
              </ul>

              {/* Newsletter */}
              <h4 className="text-white text-sm mb-3" style={{ fontWeight: 600 }}>
                Stay Updated
              </h4>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 min-w-0 text-sm text-white rounded px-3 py-2 outline-none placeholder-slate-500 focus:border-[#0A8A78] transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded text-sm text-white flex-shrink-0 transition-colors hover:bg-[#098872]"
                  style={{ backgroundColor: "#0A8A78" }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="bg-[#081829]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} NexLife International, Inc.® All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A8A78]" />
              ISO 13485:2016
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A8A78]" />
              FDA Registered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A8A78]" />
              CE Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
