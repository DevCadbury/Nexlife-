"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone, Mail, ShoppingCart, Star, TrendingUp, Clock, Globe } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useCategories } from "@/lib/hooks/useCategories";
import { useFeaturedProducts } from "@/lib/hooks/useFeaturedProducts";
import { useStarredProducts } from "@/lib/hooks/useStarredProducts";
import { useRecentProducts } from "@/lib/hooks/useRecentProducts";
import type { Category } from "@/lib/types/product";

// The frontend is always the surgical site — no site-switching needed here.
// Site switching (surgical vs general) is managed inside the CRM admin panel.
const SITE = "surgical";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products", hasDropdown: true },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Cross-site banner shown as a subtle pill in the nav
const MAIN_SITE_URL = "https://www.nexlifeinternational.com/";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  // Track client mount to avoid hydration mismatch from localStorage-based cart count
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { getCartCount } = useCart();

  const { data: categoriesData } = useCategories(SITE);
  const { data: featuredData } = useFeaturedProducts(SITE);
  const { data: starredData } = useStarredProducts(SITE);
  const { data: recentData } = useRecentProducts(SITE, 4);
  const apiCategories: Category[] = categoriesData?.items ?? [];
  // "Popular" column = starred products (fall back to featured if none are starred)
  const apiPopularProducts =
    (starredData?.items?.length ? starredData.items : featuredData?.items ?? []).slice(0, 3);
  // "Recent" column = most recently added products
  const apiRecentProducts = (recentData?.items ?? []).slice(0, 3);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Only read cart count after mount to avoid server/client mismatch
  const cartCount = mounted ? getCartCount() : 0;

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#0D2240] text-white text-sm hidden md:flex items-center justify-between px-8 py-2">
        <div className="flex items-center gap-6">
          <a href="tel:+919664843790" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs transition-colors">
            <Phone size={12} />
            +91 96648 43790
          </a>
          <a href="tel:+918401546910" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs transition-colors">
            <Phone size={12} />
            +91 84015 46910
          </a>
          <a href="mailto:Info@nexlifeinternational.com" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs transition-colors">
            <Mail size={12} />
            Info@nexlifeinternational.com
          </a>
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
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/nexlife-logo.png"
              alt="NexLife International"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
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
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
                      style={{ width: "780px" }}
                    >
                      <div
                        className="rounded-xl border border-[#E2E8F0] overflow-hidden"
                        style={{ backgroundColor: "#fff", boxShadow: "0 10px 40px rgba(13,34,64,0.15)" }}
                      >
                        <div className="grid grid-cols-3 divide-x divide-[#E2E8F0]">
                          {/* Categories Column */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3 px-2">
                              <div className="w-1 h-4 rounded-full bg-[#0A8A78]" />
                              <h3 className="text-xs text-[#0D2240] uppercase tracking-wide" style={{ fontWeight: 700 }}>
                                Categories
                              </h3>
                            </div>
                            <div className="space-y-0.5">
                              {apiCategories.length > 0 ? (
                                apiCategories.map((cat) => (
                                  <Link
                                    key={cat._id}
                                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-[#0D2240] hover:bg-[#F7F8FA] transition-all duration-100 group"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0A8A78] transition-colors" />
                                    <span className="text-sm">{cat.name}</span>
                                  </Link>
                                ))
                              ) : (
                                <div className="space-y-2 px-3 py-2">
                                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                                  <div className="h-4 bg-slate-200 rounded animate-pulse w-4/5" />
                                  <div className="h-4 bg-slate-200 rounded animate-pulse w-3/5" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Popular Products Column */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3 px-2">
                              <TrendingUp size={14} className="text-[#0A8A78]" />
                              <h3 className="text-xs text-[#0D2240] uppercase tracking-wide" style={{ fontWeight: 700 }}>
                                Popular
                              </h3>
                            </div>
                            <div className="space-y-2">
                              {apiPopularProducts.length > 0 ? (
                                apiPopularProducts.slice(0, 3).map((product) => {
                                  const pName = product.name.replace(/^[a-f0-9]{24}/i, "").trim() || product.name;
                                  return (
                                  <Link
                                    key={product._id}
                                    href={`/product/${product.slug ?? product._id}`}
                                    className="flex gap-2 p-2 rounded-lg hover:bg-[#F7F8FA] transition-all duration-150 group"
                                  >
                                    <div className="relative w-12 h-12 flex-shrink-0 rounded bg-[#F7F8FA] overflow-hidden">
                                      {product.images[0]?.secure_url ? (
                                        <Image
                                          src={product.images[0].secure_url}
                                          alt={pName}
                                          fill
                                          className="object-cover"
                                          sizes="48px"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-slate-100" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs text-slate-900 font-medium truncate group-hover:text-[#0A8A78] transition-colors">
                                        {pName}
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star key={s} size={8} fill="#F59E0B" className="text-amber-400" />
                                        ))}
                                      </div>
                                      {product.price && !product.hidePrice && (
                                        <div className="text-xs text-[#0A8A78] mt-0.5" style={{ fontWeight: 600 }}>
                                          {product.price}
                                        </div>
                                      )}
                                    </div>
                                  </Link>
                                  );
                                })
                              ) : (
                                <div className="text-xs text-slate-400 px-2 py-1">No products available</div>
                              )}
                            </div>
                          </div>

                          {/* Recent Products Column */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3 px-2">
                              <Clock size={14} className="text-[#0A8A78]" />
                              <h3 className="text-xs text-[#0D2240] uppercase tracking-wide" style={{ fontWeight: 700 }}>
                                Recent
                              </h3>
                            </div>
                            <div className="space-y-2">
                              {apiRecentProducts.length > 0 ? (
                                apiRecentProducts.map((product) => {
                                  const pName = product.name.replace(/^[a-f0-9]{24}/i, "").trim() || product.name;
                                  const pCat = /^[a-f0-9]{24}$/i.test(product.category) ? "" : product.category;
                                  return (
                                  <Link
                                    key={product._id}
                                    href={`/product/${product.slug ?? product._id}`}
                                    className="flex gap-2 p-2 rounded-lg hover:bg-[#F7F8FA] transition-all duration-150 group"
                                  >
                                    <div className="relative w-12 h-12 flex-shrink-0 rounded bg-[#F7F8FA] overflow-hidden">
                                      {product.images[0]?.secure_url ? (
                                        <Image
                                          src={product.images[0].secure_url}
                                          alt={pName}
                                          fill
                                          className="object-cover"
                                          sizes="48px"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-slate-100" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs text-slate-900 font-medium truncate group-hover:text-[#0A8A78] transition-colors">
                                        {pName}
                                      </div>
                                      {pCat && (
                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                          {pCat}
                                        </div>
                                      )}
                                      {product.price && !product.hidePrice && (
                                        <div className="text-xs text-[#0A8A78] mt-0.5" style={{ fontWeight: 600 }}>
                                          {product.price}
                                        </div>
                                      )}
                                    </div>
                                  </Link>
                                  );
                                })
                              ) : (
                                <div className="text-xs text-slate-400 px-2 py-1">No products available</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom CTA */}
                        <div className="border-t border-[#E2E8F0] bg-[#F7F8FA] px-4 py-3">
                          <Link
                            href="/products"
                            className="flex items-center justify-center gap-2 text-sm text-[#0A8A78] hover:text-[#098872] transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            View All Products
                            <ChevronDown size={14} className="-rotate-90" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
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
            {/* Cross-site link */}
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all duration-150"
              style={{
                color: "#0D2240",
                borderColor: "#D0D7E0",
                background: "#F7F8FA",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0D2240";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#0D2240";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F7F8FA";
                e.currentTarget.style.color = "#0D2240";
                e.currentTarget.style.borderColor = "#D0D7E0";
              }}
            >
              <Globe size={11} />
              Pharma Site ↗
            </a>
            <Link
              href="/cart"
              className="relative p-2.5 rounded text-[#0D2240] hover:bg-[#F7F8FA] transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center"
                  style={{ backgroundColor: "#0A8A78", fontWeight: 600, fontSize: "10px" }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded text-sm text-white transition-all duration-150 active:scale-95"
              style={{ backgroundColor: "#0A8A78", boxShadow: "0 1px 4px rgba(10,138,120,0.25)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile actions: pharma link + cart + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-full border"
              style={{ color: "#0D2240", borderColor: "#D0D7E0", background: "#F7F8FA" }}
              aria-label="Visit Nexlife Pharma site"
            >
              <Globe size={11} />
              Pharma ↗
            </a>
            <Link
              href="/cart"
              className="relative p-2 rounded text-[#0D2240] hover:bg-[#F7F8FA] transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center"
                  style={{ backgroundColor: "#0A8A78", fontWeight: 600, fontSize: "9px" }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="p-2 text-[#0D2240] hover:bg-[#F7F8FA] rounded transition-colors"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
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
                href={link.href}
                className="flex items-center px-3 py-3 rounded text-sm text-[#0D2240] hover:bg-[#F7F8FA] transition-colors"
                style={{ fontWeight: 500 }}
              >
                {link.label}
              </Link>
              {link.hasDropdown && apiCategories.length > 0 && (
                <div className="pl-4 pb-1">
                  {apiCategories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="flex items-center px-3 py-2 rounded text-sm text-slate-500 hover:text-[#0D2240] hover:bg-[#F7F8FA] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-[#E2E8F0]">
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 w-full py-3 rounded text-sm text-[#0D2240] border-2 border-[#0A8A78] mb-3 transition-colors hover:bg-[#F7F8FA]"
            style={{ fontWeight: 600 }}
          >
            <ShoppingCart size={18} />
            Cart
            {cartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#0A8A78" }}>
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/contact"
            className="block w-full text-center py-3 rounded text-sm text-white transition-colors hover:bg-[#098872]"
            style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
          >
            Get a Quote
          </Link>
          {/* Cross-site link in mobile drawer */}
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full text-center py-2.5 rounded text-sm border transition-colors"
            style={{ color: "#0D2240", borderColor: "#D0D7E0", fontWeight: 600, background: "#F7F8FA" }}
          >
            <Globe size={13} />
            Nexlife Pharma Site ↗
          </a>
          <div className="mt-4 space-y-2">
            <a href="tel:+919664843790" className="flex items-center gap-2 text-sm text-slate-500 px-1 hover:text-[#0A8A78]">
              <Phone size={14} className="text-[#0A8A78]" />
              +91 96648 43790
            </a>
            <a href="tel:+918401546910" className="flex items-center gap-2 text-sm text-slate-500 px-1 hover:text-[#0A8A78]">
              <Phone size={14} className="text-[#0A8A78]" />
              +91 84015 46910
            </a>
            <a href="mailto:Info@nexlifeinternational.com" className="flex items-center gap-2 text-sm text-slate-500 px-1 hover:text-[#0A8A78]">
              <Mail size={14} className="text-[#0A8A78]" />
              Info@nexlifeinternational.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
