import React, { useState } from "react";
import { Link } from "react-router-dom";
import nexlifeLogo from "../assets/images/nexlife-logo.png";
import {
  Navbar as ANavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo as ANavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./ui/resizable-navbar";

const Navbar = () => {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "About Us", link: "/about" },
    { 
      name: "Products", 
      link: "/products",
      dropdown: [
        { name: "Product Catalogue", link: "/products" },
        { name: "Product Gallery", link: "/product-gallery" }
      ]
    },
    { name: "Services", link: "/services" },
    { 
      name: "Gallery", 
      link: "/gallery",
      dropdown: [
        { name: "Photo Gallery", link: "/gallery" },
        { name: "Certifications", link: "/certifications" }
      ]
    },
    { name: "Global Presence", link: "/global-presence" },
    { name: "Contact", link: "/contact" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState(null);

  const handleCallUs = () => {
    window.location.href = "tel:+919664843790";
  };

  return (
    <div className="relative w-full">
      <ANavbar>
        {/* Desktop Navigation */}
        <NavBody>
          <ANavbarLogo src={nexlifeLogo} alt="" />
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            <NavbarButton variant="secondary" onClick={handleCallUs}>
              Call Us
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-white dark:bg-white rounded-xl p-2 shadow-md">
                <img src={nexlifeLogo} alt="Nexlife" className="h-8 w-auto" />
              </div>
            </Link>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <div key={`mobile-link-${idx}`}>
                {item.dropdown ? (
                  <div className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <button
                      onClick={() => setExpandedMobileItem(expandedMobileItem === idx ? null : idx)}
                      className="w-full text-left px-4 py-3 text-neutral-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                    >
                      <span className="block text-base font-medium">{item.name}</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedMobileItem === idx ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedMobileItem === idx && (
                      <div className="bg-slate-50 dark:bg-slate-800/50">
                        {item.dropdown.map((subItem, subIdx) => (
                          <Link
                            key={`mobile-dropdown-${idx}-${subIdx}`}
                            to={subItem.link}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setExpandedMobileItem(null);
                            }}
                            className="block px-8 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative rounded-lg px-4 py-3 text-neutral-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 block"
                  >
                    <span className="block text-base font-medium">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
            <div className="flex w-full flex-col gap-3 pt-3 border-t border-slate-200 dark:border-slate-600">
              <NavbarButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleCallUs();
                }}
                variant="primary"
                className="w-full py-4 text-base"
              >
                📞 Call Us
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </ANavbar>
    </div>
  );
};

export default Navbar;
