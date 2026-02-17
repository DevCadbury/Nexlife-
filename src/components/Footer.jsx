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
    <footer className="bg-slate-900 text-slate-200 relative z-20 overflow-hidden">
      {/* Subtle world map background */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <img
          src="/map.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.05]"
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 py-12 sm:py-14">

          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-5">
            <Link to="/" aria-label="Go to home" className="inline-block">
              <div className="bg-white rounded-xl p-3 inline-block">
                <img
                  src={logo}
                  alt="Nexlife International"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leading pharmaceutical import & export solutions worldwide.
              Innovating healthcare, improving lives through quality, integrity,
              and global partnerships.
            </p>
            {/* Social Icons Row */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-slate-100 text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-slate-400" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              {t("contactInfo")}
            </h3>
            <div className="space-y-3.5">
              <a
                href="mailto:Info@nexlifeinternational.com"
                className="flex items-start gap-3 text-gray-400 hover:text-white text-sm transition-colors duration-200 group"
              >
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400 group-hover:text-sky-400 transition-colors" />
                <span className="break-all">Info@nexlifeinternational.com</span>
              </a>
              <div className="flex items-start gap-3 text-slate-400 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <div className="space-y-1">
                  <a href="tel:+919664843790" className="block hover:text-white transition-colors duration-200">
                    +91 96648 43790
                  </a>
                  <a href="tel:+918401546910" className="block hover:text-white transition-colors duration-200">
                    +91 84015 46910
                  </a>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=S-223+Angel+Business+Center+2+Near+ABC+Circle+Mota+Varachha+Surat+394101+Gujarat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-slate-400 hover:text-slate-100 text-sm transition-colors duration-200 group"
              >
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400 group-hover:text-sky-400 transition-colors" />
                <span>Surat, Gujarat, India</span>
              </a>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Connect
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Have a question or business inquiry? Reach out to us directly.
            </p>
            <a
              href="https://wa.me/919664843790"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-400 text-xs">
              {t("copyright")}
            </p>
            <div className="flex items-center gap-5 text-xs">
              <Link
                to="/privacy"
                className="text-slate-400 hover:text-slate-200 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-slate-400 hover:text-slate-200 transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

