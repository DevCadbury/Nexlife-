"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  Languages,
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";

export const Navbar = ({ children }) => {
  return (
    <div className="fixed top-0 inset-x-0 z-50">
      {/* Top Ribbon - Contact Info & Social Media */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 text-[10px] sm:text-xs">
        <div className="mx-auto max-w-7xl px-2 sm:px-8 lg:px-12">
          <div className="flex flex-wrap sm:flex-row justify-between items-center gap-1 sm:gap-0">
            {/* Left Side - Contact Information */}
            <div className="flex flex-nowrap items-center gap-2 sm:space-x-6 overflow-x-auto no-scrollbar">
              <a
                href="mailto:Info@nexlifeinternational.com"
                className="flex items-center space-x-1 hover:text-blue-200 transition-colors duration-200"
              >
                <Mail className="w-3 h-3 text-blue-200 flex-shrink-0" />
                <span className="text-white">
                  Info@nexlifeinternational.com
                </span>
              </a>
              <div className="flex items-center gap-1 text-white">
                <Phone className="w-3 h-3 text-blue-200 flex-shrink-0" />
                <a
                  href="tel:+919664843790"
                  className="hover:text-blue-200 transition-colors duration-200 whitespace-nowrap"
                >
                  +91 96648 43790
                </a>
                <span className="w-1 h-1 rounded-full bg-white/60 inline-block" />
                <a
                  href="tel:+918401546910"
                  className="hover:text-blue-200 transition-colors duration-200 whitespace-nowrap"
                >
                  +91 84015 46910
                </a>
              </div>
            </div>

            {/* Right Side - Social Media Icons & Theme Toggle */}
            <div className="hidden sm:flex items-center gap-1 sm:space-x-2 flex-wrap justify-center">
              <motion.a
                href="https://www.facebook.com/profile.php?id=61574990395658"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.07 }}
                whileTap={{ scale: 0.95, rotate: -3 }}
                className="text-white hover:text-blue-200 transition-all duration-200 p-2 hover:bg-white/20 rounded-lg shadow-sm hover:shadow-md"
                aria-label="Facebook"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://x.com/Nexlife_?t=87n-aaHiSqDu8mEqj5SHMw&s=09"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.07 }}
                whileTap={{ scale: 0.95, rotate: -3 }}
                className="text-white hover:text-blue-200 transition-all duration-200 p-2 hover:bg-white/20 rounded-lg shadow-sm hover:shadow-md"
                aria-label="X (Twitter)"
                title="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/nexlife-international-02a04235a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.07 }}
                whileTap={{ scale: 0.95, rotate: -3 }}
                className="text-white hover:text-blue-200 transition-all duration-200 p-2 hover:bg-white/20 rounded-lg shadow-sm hover:shadow-md"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/nexlife_international?igsh=MWwwaWc0NXFtZDBleg=="
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.07 }}
                whileTap={{ scale: 0.95, rotate: -3 }}
                className="text-white hover:text-blue-200 transition-all duration-200 p-2 hover:bg-white/20 rounded-lg shadow-sm hover:shadow-md"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://wa.link/qu1439"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.07 }}
                whileTap={{ scale: 0.95, rotate: -3 }}
                className="text-white hover:text-green-300 transition-all duration-200 p-2 hover:bg-white/20 rounded-lg shadow-sm hover:shadow-md"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </motion.a>

              {/* Divider */}
              <div className="w-px h-4 bg-white/20 mx-1"></div>

              {/* Translate & Theme */}

              <ThemeToggle />
            </div>
            {/* Mobile-only compact socials and controls */}
            <div className="w-full sm:hidden flex items-center justify-between gap-2 pt-1 px-1">
              <div className="flex items-center gap-2">
                <motion.a
                  href="https://www.facebook.com/profile.php?id=61574990395658"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -1, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 rounded bg-white/10 text-white"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </motion.a>
                <motion.a
                  href="https://x.com/Nexlife_?t=87n-aaHiSqDu8mEqj5SHMw&s=09"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -1, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 rounded bg-white/10 text-white"
                  aria-label="X (Twitter)"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </motion.a>
                <motion.a
                  href="https://www.linkedin.com/in/nexlife-international-02a04235a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -1, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 rounded bg-white/10 text-white"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/nexlife_international?igsh=MWwwaWc0NXFtZDBleg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -1, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1 rounded bg-white/10 text-white"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </motion.a>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-white/10 text-white">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="relative mt-2 rounded-2xl border border-blue-400/30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-[0_10px_30px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/10 overflow-hidden">
          {/* Edge lighting layer */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-[linear-gradient(130deg,rgba(59,130,246,0),rgba(59,130,246,0.6),rgba(99,102,241,0.6),rgba(59,130,246,0))] [background-size:200%_200%] animate-edgeGlow opacity-60"></div>
          {/* Top and bottom light accents */}
          <div className="pointer-events-none absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[2px] opacity-60"></div>
          <div className="pointer-events-none absolute inset-x-10 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[2px] opacity-60"></div>
          {children}
        </div>
      </div>
    </div>
  );
};

export const NavBody = ({ children }) => {
  return (
    <div className="hidden md:flex items-center justify-between px-4 py-3">
      {children}
    </div>
  );
};

export const NavbarLogo = ({ src, alt = "Nexlife International" }) => {
  return (
    <Link to="/" className="relative flex items-center gap-2">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-10 w-auto drop-shadow-[0_2px_8px_rgba(59,130,246,0.35)]"
        />
      ) : (
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_6px_20px_rgba(59,130,246,0.45)]" />
      )}
    </Link>
  );
};

// 3D/Glow nav item
const GlowNavItem = ({ to, children }) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02, rotateX: -2, rotateY: 2 }}
      whileTap={{ scale: 0.98 }}
      className="relative group [transform-style:preserve-3d]"
    >
      <Link
        to={to}
        className="relative inline-flex h-10 items-center rounded-xl border border-blue-400/20 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white/60 hover:bg-gradient-to-br hover:from-blue-50/70 hover:to-indigo-50/70 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.15),0_6px_16px_rgba(59,130,246,0.12)] transform-gpu"
      >
        {/* neon underline */}
        <span className="pointer-events-none absolute bottom-0 left-2 right-2 h-[2px] scale-x-0 origin-left bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 blur-[1px] transition-transform duration-300 group-hover:scale-x-100" />
        <span className="relative">{children}</span>
      </Link>
      {/* outer glow sweep */}
      <span className="pointer-events-none absolute -inset-1 -z-10 rounded-xl bg-[radial-gradient(20px_20px_at_10%_10%,rgba(59,130,246,0.25),transparent),radial-gradient(20px_20px_at_90%_90%,rgba(99,102,241,0.25),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
};

export const NavItems = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 [perspective:1200px]">
      {items.map((item, idx) => (
        <GlowNavItem key={`nav-item-${idx}`} to={item.link}>
          {item.name}
        </GlowNavItem>
      ))}
    </nav>
  );
};

export const NavbarButton = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 h-10 text-sm font-semibold transition-all transform-gpu";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)]"
      : variant === "secondary"
      ? "bg-white text-blue-700 border border-blue-600 hover:bg-blue-50 shadow-[0_4px_14px_rgba(59,130,246,0.15)]"
      : "bg-gray-100 text-gray-700";
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${styles} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const MobileNav = ({ children }) => {
  return <div className="md:hidden px-2 py-2">{children}</div>;
};

export const MobileNavHeader = ({ children }) => {
  return (
    <div className="flex items-center justify-between px-2 py-2">
      {children}
    </div>
  );
};

export const MobileNavToggle = ({ isOpen, onClick }) => {
  return (
    <button
      aria-label="Toggle menu"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-white text-gray-700 shadow-sm"
    >
      <span className="sr-only">Menu</span>
      <div className="relative h-4 w-5">
        <span
          className={`absolute inset-x-0 top-0 h-0.5 bg-gray-800 transition-transform ${
            isOpen ? "translate-y-1.5 rotate-45" : ""
          }`}
        />
        <span
          className={`absolute inset-x-0 top-1.5 h-0.5 bg-gray-800 transition-opacity ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute inset-x-0 top-3 h-0.5 bg-gray-800 transition-transform ${
            isOpen ? "-translate-y-1.5 -rotate-45" : ""
          }`}
        />
      </div>
    </button>
  );
};

export const MobileNavMenu = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-3 pb-3"
        >
          <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
