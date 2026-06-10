import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, ChevronDown, Phone, Mail } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products", children: [
    { label: "Surgical Instruments", href: "/products?category=surgical-instruments" },
    { label: "Disposable Gloves", href: "/products?category=disposable-gloves" },
    { label: "Face Masks & Respirators", href: "/products?category=face-masks-respirators" },
    { label: "Syringes & Needles", href: "/products?category=syringes-needles" },
    { label: "Wound Care", href: "/products?category=wound-care" },
    { label: "Protective Apparel", href: "/products?category=protective-apparel" },
  ]},
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#0D2240] text-white text-sm hidden md:flex items-center justify-between px-8 py-2">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-slate-300 text-xs">
            <Phone size={12} />
            +1 (800) 639-5433
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 text-xs">
            <Mail size={12} />
            sales@nexlifeinternational.com
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-xs">
          <span>ISO 13485 Certified</span>
          <span className="w-px h-3 bg-slate-600" />
          <span>FDA Registered Facility</span>
          <span className="w-px h-3 bg-slate-600" />
          <span>Global Shipping</span>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className="sticky top-0 z-50 w-full transition-all duration-200"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: isScrolled ? "0 1px 12px rgba(13,34,64,0.10)" : "0 1px 0 #E2E8F0",
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold tracking-tight"
              style={{ backgroundColor: "#0A8A78" }}
            >
              N
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[#0D2240] tracking-tight" style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                NexLife International
              </span>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase" style={{ letterSpacing: "0.1em" }}>
                Medical &amp; Surgical
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className="flex items-center gap-1 px-4 py-2 text-sm text-slate-600 hover:text-[#0D2240] transition-colors duration-150 relative group"
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className="transition-transform duration-200"
                      style={{ transform: activeDropdown === link.label ? "rotate(180deg)" : "rotate(0)" }}
                    />
                    <span
                      className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#0A8A78] origin-left transition-transform duration-200 scale-x-0 group-hover:scale-x-100"
                    />
                  </button>
                  {activeDropdown === link.label && (
                    <div
                      className="absolute top-full left-0 pt-1 z-50"
                      style={{ minWidth: "220px" }}
                    >
                      <div
                        className="rounded border border-[#E2E8F0] overflow-hidden py-1"
                        style={{ backgroundColor: "#fff", boxShadow: "0 4px 24px rgba(13,34,64,0.10)" }}
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block px-4 py-2.5 text-sm text-slate-600 hover:text-[#0D2240] hover:bg-[#F7F8FA] transition-colors duration-100"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="relative px-4 py-2 text-sm text-slate-600 hover:text-[#0D2240] transition-colors duration-150 group"
                >
                  {link.label}
                  <span
                    className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#0A8A78] origin-left transition-transform duration-200 scale-x-0 group-hover:scale-x-100"
                  />
                </Link>
              )
            )}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded text-sm text-white transition-all duration-150 active:scale-95"
              style={{ backgroundColor: "#0A8A78", boxShadow: "0 1px 4px rgba(10,138,120,0.25)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#0D2240] hover:bg-[#F7F8FA] rounded transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer backdrop */}
      <div
        className="fixed inset-0 z-[60] transition-opacity duration-300 md:hidden"
        style={{
          backgroundColor: "rgba(13,34,64,0.55)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className="fixed top-0 right-0 z-[70] h-full w-[300px] bg-white md:hidden transition-transform duration-300 ease-in-out flex flex-col"
        style={{
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          boxShadow: "-4px 0 24px rgba(13,34,64,0.12)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <span className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "15px" }}>
            NexLife International
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded hover:bg-[#F7F8FA] text-slate-500 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                to={link.href}
                className="flex items-center px-3 py-3 rounded text-sm text-[#0D2240] hover:bg-[#F7F8FA] transition-colors"
                style={{ fontWeight: 500 }}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="pl-4 pb-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="flex items-center px-3 py-2 rounded text-sm text-slate-500 hover:text-[#0D2240] hover:bg-[#F7F8FA] transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-[#E2E8F0]">
          <Link
            to="/contact"
            className="block w-full text-center py-3 rounded text-sm text-white transition-colors"
            style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
          >
            Get a Quote
          </Link>
          <div className="mt-4 space-y-2">
            <a href="tel:+18006395433" className="flex items-center gap-2 text-sm text-slate-500 px-1">
              <Phone size={14} className="text-[#0A8A78]" />
              +1 (800) 639-5433
            </a>
            <a href="mailto:sales@nexlifeinternational.com" className="flex items-center gap-2 text-sm text-slate-500 px-1">
              <Mail size={14} className="text-[#0A8A78]" />
              sales@nexlifeinternational.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
