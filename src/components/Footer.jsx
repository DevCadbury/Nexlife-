import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import logo from "../assets/images/nexlife-logo.png";
import mapImg from "../assets/images/map.png";

const Footer = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { name: t("home"), href: "/" },
    { name: t("about"), href: "/about" },
    { name: t("products"), href: "/products" },
    { name: t("services"), href: "/services" },
    { name: t("globalPresence"), href: "/global-presence" },
    { name: t("contact"), href: "/contact" },
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/nexlife-international-02a04235a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      icon: Linkedin,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/nexlife_international?igsh=MWwwaWc0NXFtZDBleg==",
      icon: Instagram,
    },
    {
      name: "X",
      href: "https://x.com/Nexlife_?t=87n-aaHiSqDu8mEqj5SHMw&s=09",
      icon: Twitter,
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61574990395658",
      icon: Facebook,
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/919664843790",
      icon: MessageCircle,
    },
  ];

  return (
    <footer className="relative z-20 overflow-hidden text-slate-200 bg-slate-950">
      {/* ── Background layers ── */}
      <div className="absolute inset-0">
        {/* Map overlay – imported so Vite hashes it correctly for production */}
        <img src={mapImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-screen pointer-events-none select-none" draggable={false} aria-hidden="true" />
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
      </div>

      {/* ── Main content ── */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14 border-b border-white/10">

          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-5">
            <Link to="/" aria-label="Go to home" className="inline-block">
              <div className="bg-white rounded-xl p-3 inline-block shadow-lg">
                <img src={logo} alt="Nexlife International" className="h-10 w-auto object-contain" />
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leading pharmaceutical import &amp; export solutions worldwide.
              Innovating healthcare, improving lives through quality, integrity,
              and global partnerships.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/8 border border-white/10 hover:bg-blue-600 hover:border-blue-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-white tracking-wide after:block after:mt-2 after:w-8 after:h-[2px] after:bg-blue-500 after:rounded-full">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-slate-300 hover:text-blue-400 text-sm transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue-400" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-white tracking-wide after:block after:mt-2 after:w-8 after:h-[2px] after:bg-blue-500 after:rounded-full">
              Contact
            </h3>
            <div className="space-y-4">
              <a
                href="mailto:Info@nexlifeinternational.com"
                className="flex items-start gap-3 text-slate-200 hover:text-blue-400 text-sm transition-colors duration-200 group"
              >
                <span className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/40 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                </span>
                <span className="break-all pt-1">Info@nexlifeinternational.com</span>
              </a>
              <div className="flex items-start gap-3 text-slate-200 text-sm">
                <span className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                </span>
                <div className="space-y-1 pt-1">
                  <a href="tel:+919664843790" className="block hover:text-blue-400 transition-colors">+91 96648 43790</a>
                  <a href="tel:+918401546910" className="block hover:text-blue-400 transition-colors">+91 84015 46910</a>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=S-223+Angel+Business+Center+2+Near+ABC+Circle+Mota+Varachha+Surat+394101+Gujarat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-slate-200 hover:text-blue-400 text-sm transition-colors duration-200 group"
              >
                <span className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/40 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                </span>
                <span className="pt-1">Surat, Gujarat, India</span>
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-white tracking-wide after:block after:mt-2 after:w-8 after:h-[2px] after:bg-blue-500 after:rounded-full">
              Get in Touch
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Have a business inquiry or partnership opportunity? Reach out directly.
            </p>
            <a
              href="https://wa.me/919664843790"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-900/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* ── Contact Strip ── */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/10">
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 transition-colors">
            <span className="w-10 h-10 rounded-full bg-blue-600/25 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-400" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Office Address</p>
              <p className="text-xs text-white leading-snug">S-223 Angel Business Center 2, Surat, Gujarat</p>
            </div>
          </div>
          <a
            href="mailto:Info@nexlifeinternational.com"
            className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/8 hover:bg-blue-600/20 hover:border-blue-500/40 transition-colors group"
          >
            <span className="w-10 h-10 rounded-full bg-blue-600/25 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-blue-400" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Send Email</p>
              <p className="text-xs text-white group-hover:text-blue-400 transition-colors">Info@nexlifeinternational.com</p>
            </div>
          </a>
          <a
            href="tel:+919664843790"
            className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/8 hover:bg-blue-600/20 hover:border-blue-500/40 transition-colors group"
          >
            <span className="w-10 h-10 rounded-full bg-blue-600/25 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-blue-400" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Call Us</p>
              <p className="text-xs text-white group-hover:text-blue-400 transition-colors">+91 96648 43790</p>
            </div>
          </a>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-400 text-xs">{t("copyright")}</p>
          <div className="flex items-center gap-5 text-xs">
            <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

