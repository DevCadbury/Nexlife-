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
    { name: "Products", link: "/products" },
    { name: "Services", link: "/services" },
    { name: "Global Presence", link: "/global-presence" },
    { name: "Contact", link: "/contact" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCallUs = () => {
    window.location.href = "tel:+919876543210";
  };

  return (
    <div className="relative w-full" style={{ minWidth: "768px" }}>
      <ANavbar>
        {/* Desktop Navigation */}
        <NavBody>
          <ANavbarLogo src={nexlifeLogo} alt="" />
          <NavItems items={navItems} />
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex flex-col space-y-1">
              <a
                href="mailto:Info@nexlifeinternational.com"
                className="text-sm text-gray-600 hover:text-blue-700 transition-colors duration-200"
              >
                Info@nexlifeinternational.com
              </a>
              <a
                href="tel:+919664843790"
                className="text-sm text-gray-600 hover:text-blue-700 transition-colors duration-200"
              >
                (+91) 96648 43790
              </a>
            </div>
            <NavbarButton variant="secondary" onClick={handleCallUs}>
              Call Us
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <Link to="/" className="flex items-center gap-2">
              <img src={nexlifeLogo} alt="Nexlife" className="h-10 w-auto" />
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
              <Link
                key={`mobile-link-${idx}`}
                to={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative rounded-lg px-3 py-2 text-neutral-700 hover:bg-blue-50/60 dark:text-neutral-300"
              >
                <span className="block text-sm font-medium">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-3 pt-2">
              <NavbarButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleCallUs();
                }}
                variant="primary"
                className="w-full"
              >
                Call Us
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </ANavbar>
    </div>
  );
};

export default Navbar;
