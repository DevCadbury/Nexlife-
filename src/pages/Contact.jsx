import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  X,
} from "lucide-react";
import ContactForm from "../components/ContactForm";
import logo from "../assets/images/nexlife-logo.png";

const Contact = () => {
  const { t } = useTranslation();
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isBusinessHoursDialogOpen, setIsBusinessHoursDialogOpen] =
    useState(false);

  const phoneNumbers = [
    {
      label: "Primary",
      number: "+91 96648 43790",
      href: "tel:+919664843790",
      description: "Main business line",
    },
    {
      label: "Mobile",
      number: "+91 84015 46910",
      href: "tel:+918401546910",
      description: "Mobile support",
    },
    {
      label: "Secondary",
      number: "+91 88492 07934",
      href: "tel:+918849207934",
      description: "Alternative contact",
    },
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: "+91 96648 43790",
      description: "Primary contact number",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Mail,
      title: "Email",
      value: "Info@nexlifeinternational.com",
      description: "Official support mailbox",
      color: "from-green-500 to-green-600",
    },
    {
      icon: MapPin,
      title: "Address",
      value:
        "S-223, Angel Business Center – 2, Near ABC Circle, Mota Varachha, Surat - 394101 (Gujarat)",
      description: "Visit our office",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon - Sat: 9:00 AM - 6:00 PM",
      description: "IST (UTC +5:30)",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const socialLinks = [
    {
      href: "https://www.linkedin.com/in/nexlife-international-02a04235a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      label: "LinkedIn",
      icon: Linkedin,
      color: "hover:bg-[#0A66C2]/10 text-[#0A66C2]",
    },
    {
      href: "https://www.instagram.com/nexlife_international?igsh=MWwwaWc0NXFtZDBleg==",
      label: "Instagram",
      icon: Instagram,
      color: "hover:bg-[#E1306C]/10 text-[#E1306C]",
    },
    {
      href: "https://x.com/Nexlife_?t=87n-aaHiSqDu8mEqj5SHMw&s=09",
      label: "X (Twitter)",
      icon: Twitter,
      color: "hover:bg-black/10 text-black dark:text-white",
    },
    {
      href: "https://www.facebook.com/profile.php?id=61574990395658",
      label: "Facebook",
      icon: Facebook,
      color: "hover:bg-[#1877F2]/10 text-[#1877F2]",
    },
    {
      href: "https://wa.me/919664843790",
      label: "WhatsApp",
      icon: MessageCircle,
      color: "hover:bg-[#25D366]/10 text-[#25D366]",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen pt-5">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[auto,1fr] items-center gap-8"
          >
            <motion.div
              className="mx-auto md:mx-0 bg-white/70 dark:bg-white backdrop-blur rounded-2xl p-4 shadow-xl ring-1 ring-black/5"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <a href="/" aria-label="Go to home">
                <img
                  src={logo}
                  alt="Nexlife International"
                  className="h-20 md:h-24 object-contain hover:opacity-90 transition-opacity"
                  loading="eager"
                />
              </a>
            </motion.div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t("contactTitle")}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t("contactSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.a
                  href="https://wa.me/919664843790"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp
                </motion.a>
                <motion.a
                  href="mailto:Info@nexlifeinternational.com"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Mail className="w-5 h-5 mr-2" /> Email Us
                </motion.a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                <a
                  href="tel:+919664843790"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  +91 96648 43790
                </a>
                <span className="mx-2">•</span>
                <a
                  href="tel:+918401546910"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Mobile: +91 84015 46910
                </a>
              </div>
            </div>
          </motion.div>

          {/* Social row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {socialLinks.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className={`inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md ring-2 ring-black/10 dark:ring-white/10 shadow-lg hover:shadow-xl transition-all duration-300 ${s.color}`}
                aria-label={s.label}
              >
                <s.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{s.label}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats removed as requested */}

      {/* Contact Information */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {contactInfo.map((info) => (
              <motion.div
                key={info.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${info.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {info.title}
                </h3>
                <div className="text-primary-500 font-medium mb-1">
                  {info.title === "Phone" ? (
                    <a
                      href="tel:+919664843790"
                      className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {info.value}
                    </a>
                  ) : info.title === "Email" ? (
                    <a
                      href="mailto:Info@nexlifeinternational.com"
                      className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {info.value}
                    </a>
                  ) : info.title === "Address" ? (
                    <a
                      href="https://maps.google.com/?q=S-223+Angel+Business+Center+2+Near+ABC+Circle+Mota+Varachha+Surat+394101+Gujarat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                    >
                      {info.value}
                    </a>
                  ) : info.title === "Business Hours" ? (
                    <div
                      onClick={() => setIsBusinessHoursDialogOpen(true)}
                      className="cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <div className="font-semibold">{info.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {info.description}
                      </div>
                    </div>
                  ) : (
                    info.value
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  {info.title === "Business Hours"
                    ? "Click to view timezone details"
                    : info.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Send us a Message
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>
              </div>
              <ContactForm />
            </motion.div>

            {/* Company Information & Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Company Info */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Company Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        About Nexlife International
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        We are a leading pharmaceutical company specializing in
                        import and export of high-quality medicines and
                        healthcare products, serving healthcare providers
                        worldwide.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-secondary-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Headquarters
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        S-223, Angel Business Center – 2, Near ABC Circle, Mota
                        Varachha, Surat - 394101 (Gujarat)
                        <br />A major pharmaceutical hub with excellent
                        connectivity and infrastructure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Location
                </h3>
                <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.1234567890123!2d72.8312345678901!3d21.2234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e0c0c0c0c0c%3A0x0!2sS-223%2C%20Angel%20Business%20Center%20%E2%80%93%202%2C%20Near%20ABC%20Circle%2C%20Mota%20Varachha%2C%20Surat%20-%20394101%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Nexlife International Location - S-223, Angel Business Center – 2, Near ABC Circle, Mota Varachha, Surat - 394101 (Gujarat)"
                    className="rounded-lg"
                  ></iframe>
                </div>
                <div className="mt-4 text-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Angel Business Center, Mota Varachha, Surat
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    S-223, Angel Business Center – 2, Near ABC Circle, Mota
                    Varachha, Surat - 394101 (Gujarat)
                  </p>
                  <a
                    href="https://maps.google.com/?q=S-223+Angel+Business+Center+2+Near+ABC+Circle+Mota+Varachha+Surat+394101+Gujarat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Open in Google Maps
                  </a>
                </div>
              </div>

              {/* Additional Contact Details */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Additional Ways to Connect
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <a
                      href="mailto:Info@nexlifeinternational.com"
                      className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Email: Info@nexlifeinternational.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <a
                      href="tel:+919664843790"
                      className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Primary: +91 96648 43790
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <a
                      href="tel:+918849207934"
                      className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Mobile: +91 88492 07934
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <a
                      href="https://wa.me/919664843790"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline decoration-dotted hover:text-primary-600"
                    >
                      WhatsApp: Start chat
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about our services and processes.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {[
              {
                question: "How quickly can you process orders?",
                answer:
                  "Standard orders are processed within 24-48 hours. Express orders can be processed within 12 hours for urgent requirements.",
              },
              {
                question: "Do you ship internationally?",
                answer:
                  "Yes, we ship to over 50 countries worldwide with temperature-controlled packaging and real-time tracking.",
              },
              {
                question: "What quality certifications do you have?",
                answer:
                  "We are ISO 9001:2015 certified, FDA registered, and comply with WHO GMP guidelines for pharmaceutical products.",
              },
              {
                question: "How do you ensure product quality?",
                answer:
                  "All products undergo rigorous quality control testing, third-party verification, and compliance with international standards.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Contact our team today to discuss your pharmaceutical needs and
              discover how we can help you succeed in the global market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => {
                  console.log("Button clicked, opening dialog");
                  setIsCallDialogOpen(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transform transition-all duration-300"
              >
                <Phone className="w-5 h-5 mr-2" />
                Schedule a Call
              </motion.button>
              <motion.a
                href="https://wa.me/919664843790"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transform transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call Dialog */}
      <AnimatePresence>
        {isCallDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => {
              console.log("Dialog background clicked, closing dialog");
              setIsCallDialogOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Choose a Number to Call
                </h3>
                <div className="text-xs text-gray-500">
                  Dialog State: {isCallDialogOpen ? "Open" : "Closed"}
                </div>
                <button
                  onClick={() => {
                    console.log("Close button clicked");
                    setIsCallDialogOpen(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {phoneNumbers.map((phone, index) => (
                  <motion.a
                    key={index}
                    href={phone.href}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Phone className="w-6 h-6 text-primary-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {phone.label}
                          </span>
                          <span className="text-sm text-primary-500 font-medium">
                            {phone.number}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {phone.description}
                        </p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Click on any number above to start the call
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Business Hours Dialog */}
      <AnimatePresence>
        {isBusinessHoursDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setIsBusinessHoursDialogOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Business Hours
                </h3>
                <button
                  onClick={() => setIsBusinessHoursDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Operating Hours
                  </h4>
                  <div className="text-2xl font-bold text-primary-500 mb-2">
                    Mon - Sat: 9:00 AM - 6:00 PM
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    IST (UTC +5:30)
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Timezone Information
                  </h5>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Current Time (IST):</span>
                      <span className="font-mono">
                        {new Date().toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Day:</span>
                      <span className="font-mono">
                        {new Date().toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          weekday: "long",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span
                        className={`font-semibold ${(() => {
                          const now = new Date();
                          const istTime = new Date(
                            now.toLocaleString("en-US", {
                              timeZone: "Asia/Kolkata",
                            })
                          );
                          const day = istTime.getDay();
                          const hour = istTime.getHours();
                          const isWeekday = day >= 1 && day <= 6;
                          const isBusinessHours = hour >= 9 && hour < 18;
                          return isWeekday && isBusinessHours
                            ? "text-green-600"
                            : "text-red-600";
                        })()}`}
                      >
                        {(() => {
                          const now = new Date();
                          const istTime = new Date(
                            now.toLocaleString("en-US", {
                              timeZone: "Asia/Kolkata",
                            })
                          );
                          const day = istTime.getDay();
                          const hour = istTime.getHours();
                          const isWeekday = day >= 1 && day <= 6;
                          const isBusinessHours = hour >= 9 && hour < 18;
                          return isWeekday && isBusinessHours
                            ? "Open Now"
                            : "Closed";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    Contact Numbers
                  </h5>
                  <div className="space-y-3">
                    {phoneNumbers.map((phone, index) => (
                      <motion.a
                        key={index}
                        href={phone.href}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Phone className="w-4 h-4 text-primary-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {phone.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {phone.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-primary-500 font-semibold group-hover:text-primary-600 transition-colors">
                          {phone.number}
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <motion.a
                    href="https://wa.me/919664843790"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center space-x-3 w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat on WhatsApp</span>
                  </motion.a>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> We are closed on Sundays and public
                    holidays. For urgent matters outside business hours, please
                    contact us via WhatsApp.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
