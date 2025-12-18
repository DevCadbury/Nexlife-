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
} from "lucide-react";
import { motion } from "framer-motion";
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
      color: "hover:bg-[#0A66C2]/10 text-[#0A66C2]",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/nexlife_international?igsh=MWwwaWc0NXFtZDBleg==",
      icon: Instagram,
      color: "hover:bg-[#E1306C]/10 text-[#E1306C]",
    },
    {
      name: "X",
      href: "https://x.com/Nexlife_?t=87n-aaHiSqDu8mEqj5SHMw&s=09",
      icon: Twitter,
      color: "hover:bg-white/10 text-white",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61574990395658",
      icon: Facebook,
      color: "hover:bg-[#1877F2]/10 text-[#1877F2]",
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/919664843790",
      icon: MessageCircle,
      color: "hover:bg-[#25D366]/10 text-[#25D366]",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white relative z-20 pointer-events-auto">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-12">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <motion.div
              className="inline-flex items-center bg-white dark:bg-white rounded-xl p-2 sm:p-3 ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg"
              whileHover={{ scale: 1.02 }}
            >
              <Link to="/" aria-label="Go to home">
                <img
                  src={logo}
                  alt="Nexlife International"
                  className="h-8 sm:h-10 w-auto object-contain hover:opacity-95 transition-opacity"
                />
              </Link>
            </motion.div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Leading pharmaceutical import & export solutions worldwide.
              Innovating healthcare, improving lives.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Link
                    to={link.href}
                    className="relative inline-block text-gray-300 transition-colors text-xs sm:text-sm hover:text-primary-300 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-gradient-to-r from-primary-400 to-secondary-400 after:transition-all after:rounded group-hover:after:w-full"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {t("contactInfo")}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300 text-xs sm:text-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 flex-shrink-0" />
                <a
                  href="mailto:Info@nexlifeinternational.com"
                  className="hover:text-primary-300 transition-colors break-all"
                >
                  Info@nexlifeinternational.com
                </a>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300 text-xs sm:text-sm">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <a
                    href="tel:+919664843790"
                    className="hover:text-primary-300"
                  >
                    +91 96648 43790
                  </a>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-400" />
                  <a
                    href="tel:+918401546910"
                    className="hover:text-primary-300"
                  >
                    +91 84015 46910
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3 text-gray-300 text-xs sm:text-sm">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span>Surat, Gujarat, India</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-300 text-xs sm:text-sm">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 flex-shrink-0" />
                <a
                  href="https://wa.me/919664843790"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted hover:text-primary-300"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {t("socialMedia")}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: -2 }}
                  className={`group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-8 sm:h-10 rounded-full bg-gray-800/60 text-gray-200 ring-1 ring-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-current/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${social.color} min-w-0 flex-shrink-0`}
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {social.name}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              {t("copyright")}
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <Link
                  to="/privacy"
                  className="hover:text-primary-400 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="hover:text-primary-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
              <motion.a
                href="https://wa.me/919664843790"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-500 text-xs sm:text-sm"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">WhatsApp</span>
                <span className="xs:hidden">Chat</span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
