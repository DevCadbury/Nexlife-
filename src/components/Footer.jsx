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
import mapBg from "../../map.png";

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
      color: "hover:bg-[#0A66C2]/10 text-white",
      iconColor: "text-[#0A66C2]",
      bgGradient: "from-[#0A66C2]/20 to-[#004182]/20",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/nexlife_international?igsh=MWwwaWc0NXFtZDBleg==",
      icon: Instagram,
      color: "hover:bg-[#E1306C]/10 text-white",
      iconColor: "text-[#E1306C]",
      bgGradient: "from-[#E1306C]/20 to-[#C13584]/20",
    },
    {
      name: "X",
      href: "https://x.com/Nexlife_?t=87n-aaHiSqDu8mEqj5SHMw&s=09",
      icon: Twitter,
      color: "hover:bg-white/10 text-white",
      iconColor: "text-white",
      bgGradient: "from-gray-700/20 to-gray-600/20",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61574990395658",
      icon: Facebook,
      color: "hover:bg-[#1877F2]/10 text-white",
      iconColor: "text-[#1877F2]",
      bgGradient: "from-[#1877F2]/20 to-[#0d5ecc]/20",
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/919664843790",
      icon: MessageCircle,
      color: "hover:bg-[#25D366]/10 text-white",
      iconColor: "text-[#25D366]",
      bgGradient: "from-[#25D366]/20 to-[#128C7E]/20",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white relative z-20 pointer-events-auto overflow-hidden">
      {/* Background Map Image with Overlay */}
      <div 
        className="absolute inset-0 opacity-50 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${mapBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.7) contrast(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/50 to-gray-900/60 pointer-events-none z-0" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      
      <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-12 sm:py-16">
          {/* Company Info - Takes more space */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              className="inline-flex items-center bg-white dark:bg-white rounded-2xl p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-2xl"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" aria-label="Go to home">
                <img
                  src={logo}
                  alt="Nexlife International"
                  className="h-12 w-auto object-contain hover:opacity-95 transition-opacity"
                />
              </Link>
            </motion.div>
            
            <div className="bg-gradient-to-br from-primary-900/30 via-gray-800/50 to-secondary-900/30 backdrop-blur-sm rounded-2xl p-6 border border-primary-500/20 shadow-2xl hover:border-primary-500/40 transition-all duration-300 hover:shadow-primary-500/20">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full animate-pulse" />
                About Nexlife
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Leading pharmaceutical import & export solutions worldwide.
                Innovating healthcare, improving lives through quality, integrity, and global partnerships.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full" />
              {t("quickLinks")}
            </h3>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-sm rounded-xl p-4 border border-gray-700/40 hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <motion.li
                    key={link.name}
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Link
                      to={link.href}
                      className="relative inline-flex items-center gap-2 text-gray-300 transition-colors text-sm hover:text-primary-300 group"
                    >
                      <span className="w-0 h-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 transition-all group-hover:w-4 rounded-full" />
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info - Card Style */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full" />
              {t("contactInfo")}
            </h3>
            <div className="bg-gradient-to-br from-blue-900/30 via-gray-800/50 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/20 shadow-2xl space-y-4 hover:border-blue-500/40 transition-all duration-300 hover:shadow-blue-500/20">
              <div className="flex items-center gap-3 text-gray-300 text-sm group hover:text-primary-300 transition-colors">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-secondary-500/30 transition-all duration-300 shadow-lg"
                >
                  <Mail className="w-5 h-5 text-primary-400 group-hover:text-primary-300" />
                </motion.div>
                <a
                  href="mailto:Info@nexlifeinternational.com"
                  className="hover:underline break-all"
                >
                  Info@nexlifeinternational.com
                </a>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300 text-sm group hover:text-primary-300 transition-colors">
                <motion.div 
                  whileHover={{ rotate: -15, scale: 1.1 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300 shadow-lg"
                >
                  <Phone className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </motion.div>
                <div className="flex flex-col gap-1">
                  <a href="tel:+919664843790" className="hover:underline">
                    +91 96648 43790
                  </a>
                  <a href="tel:+918401546910" className="hover:underline">
                    +91 84015 46910
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300 text-sm group hover:text-primary-300 transition-colors cursor-pointer"
                onClick={() => window.open('https://maps.google.com/?q=S-223+Angel+Business+Center+2+Near+ABC+Circle+Mota+Varachha+Surat+394101+Gujarat', '_blank')}
              >
                <motion.div 
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-secondary-500/30 transition-all duration-300 shadow-lg"
                >
                  <MapPin className="w-5 h-5 text-primary-400 group-hover:text-primary-300" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 group-hover:text-gray-400">Click to view on map</span>
                  <span className="font-medium">Surat, Gujarat, India</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-300 text-sm group hover:text-primary-300 transition-colors">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-all duration-300 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                </motion.div>
                <a
                  href="https://wa.me/919664843790"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Social Media - Card Style */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full" />
              {t("socialMedia")}
            </h3>
            <div className="bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-pink-900/30 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/20 shadow-2xl hover:border-purple-500/40 transition-all duration-300 hover:shadow-purple-500/20">
              <p className="text-gray-400 text-xs mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
                Connect with us on social platforms
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -4, scale: 1.08, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br ${social.bgGradient} text-gray-200 ring-1 ring-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-current/20 hover:ring-white/20 ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className={`w-5 h-5 ${social.iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`} />
                    <span className="text-sm font-medium text-white">{social.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Enhanced */}
        <div className="border-t border-gray-800/50 backdrop-blur-sm py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 animate-pulse" />
              <p className="text-gray-400 text-sm">
                {t("copyright")}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
              <div className="flex items-center gap-6">
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-primary-400 transition-colors relative group"
                >
                  Privacy Policy
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 group-hover:w-full transition-all rounded-full" />
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-primary-400 transition-colors relative group"
                >
                  Terms of Service
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 group-hover:w-full transition-all rounded-full" />
                </Link>
              </div>
              
              <motion.a
                href="https://wa.me/919664843790"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:from-emerald-500 hover:to-emerald-400 shadow-lg hover:shadow-emerald-500/50 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
