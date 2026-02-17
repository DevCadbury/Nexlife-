import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  Globe,
  Award,
  Shield,
} from "lucide-react";
import ContactForm from "../components/ContactForm";
import logo from "../assets/images/nexlife-logo.png";

/* ─────────────────────────  Utility hook  ───────────────────────── */
const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

/* ─────────────────────────  FadeIn wrapper  ───────────────────────── */
const FadeIn = ({ children, className = "", delay = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Contact = () => {
  const { t } = useTranslation();
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isBusinessHoursDialogOpen, setIsBusinessHoursDialogOpen] =
    useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      image: "/ICONS/phone-call.png",
      title: "Phone",
      value: "+91 96648 43790",
      description: "Primary contact number",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Mail,
      image: "/ICONS/message.png",
      title: "Email",
      value: "Info@nexlifeinternational.com",
      description: "Official support mailbox",
      color: "from-green-500 to-green-600",
    },
    {
      icon: MapPin,
      image: "/ICONS/map.png",
      title: "Address",
      value:
        "S-223, Angel Business Center – 2, Near ABC Circle, Mota Varachha, Surat - 394101 (Gujarat)",
      description: "Visit our office",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      image: "/ICONS/working-time.png",
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

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] items-center gap-6 md:gap-8">
              <div className="mx-auto md:mx-0 bg-white/70 dark:bg-white backdrop-blur rounded-2xl p-3 sm:p-4 shadow-xl ring-1 ring-black/5 hover:scale-[1.03] transition-transform duration-300">
                <a href="/" aria-label="Go to home">
                  <img
                    src={logo}
                    alt="Nexlife International"
                    className="h-16 sm:h-20 md:h-24 object-contain"
                    loading="eager"
                  />
                </a>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t("contactTitle")}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6">
                  {t("contactSubtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <a
                    href="https://wa.me/919664843790"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-5 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href="mailto:Info@nexlifeinternational.com"
                    className="inline-flex items-center justify-center px-5 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Email Us
                  </a>
                </div>
                <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-3.5 h-3.5" />
                  <a
                    href="tel:+919664843790"
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    +91 96648 43790
                  </a>
                  <span className="mx-1.5">•</span>
                  <a
                    href="tel:+918401546910"
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    +91 84015 46910
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Social Links Row (moved outside hero, no overflow clipping) ── */}
      <section className="py-6 sm:py-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${s.color}`}
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    {s.label}
                  </span>
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Contact Information Cards ── */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {contactInfo.map((info, i) => (
              <FadeIn key={info.title} delay={i * 100}>
                <div className="text-center group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={info.image}
                      alt={info.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                    {info.title}
                  </h3>
                  <div className="text-primary-500 font-medium text-sm mb-1">
                    {info.title === "Phone" ? (
                      <a href="tel:+919664843790" className="hover:text-primary-600 transition-colors">
                        {info.value}
                      </a>
                    ) : info.title === "Email" ? (
                      <a href="mailto:Info@nexlifeinternational.com" className="hover:text-primary-600 transition-colors break-all">
                        {info.value}
                      </a>
                    ) : info.title === "Address" ? (
                      <a
                        href="https://maps.google.com/?q=S-223+Angel+Business+Center+2+Near+ABC+Circle+Mota+Varachha+Surat+394101+Gujarat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-600 transition-colors cursor-pointer"
                      >
                        {info.value}
                      </a>
                    ) : info.title === "Business Hours" ? (
                      <div
                        onClick={() => setIsBusinessHoursDialogOpen(true)}
                        className="cursor-pointer hover:text-primary-600 transition-colors"
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
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    {info.title === "Business Hours"
                      ? "Click to view timezone details"
                      : info.description}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Form & Map ── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <FadeIn>
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
            </FadeIn>

            {/* Company Information & Map */}
            <FadeIn delay={150}>
              <div className="space-y-8">
                {/* Company Info */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
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

                {/* Google Maps Embed — FIXED: search-based URL */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                    Our Location
                  </h3>
                  <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <iframe
                      src="https://maps.google.com/maps?q=Angel+Business+Center+2+Mota+Varachha+Surat&output=embed"
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
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
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
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-block mb-4 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center p-3 shadow-lg hover:scale-110 transition-transform duration-300">
                <img
                  src="/ICONS/faq.png"
                  alt="FAQ"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Find answers to common questions about our services and processes.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: "/ICONS/save-time.png",
                question: "How quickly can you process orders?",
                answer:
                  "Standard orders are processed within 24-48 hours. Express orders can be processed within 12 hours for urgent requirements.",
                highlights: ["24-48 hours standard", "12 hours express option"],
              },
              {
                icon: "/ICONS/transportation.png",
                question: "Do you ship internationally?",
                answer:
                  "Yes, we ship to over 50 countries worldwide with temperature-controlled packaging and real-time tracking.",
                highlights: [
                  "50+ countries",
                  "Temperature-controlled",
                  "Real-time tracking",
                ],
              },
              {
                icon: "/ICONS/certificate.png",
                question: "What quality certifications do you have?",
                answer:
                  "We maintain the highest industry standards with comprehensive certifications.",
                highlights: [
                  "ISO 9001:2015 certified",
                  "FDA registered",
                  "WHO GMP compliant",
                ],
              },
              {
                icon: "/ICONS/best-product.png",
                question: "How do you ensure product quality?",
                answer:
                  "Our multi-layered quality assurance process ensures pharmaceutical excellence.",
                highlights: [
                  "Rigorous quality control testing",
                  "Third-party verification",
                  "International compliance",
                ],
              },
            ].map((faq, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-2xl hover:-translate-y-2 transition-[box-shadow,transform,border-color] duration-300 relative overflow-hidden group">
                  {/* Gradient accent bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                  {/* Icon */}
                  <div className="w-16 h-16 mb-4 rounded-xl flex items-center justify-center shadow-lg p-3 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={faq.icon}
                      alt={faq.question}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Question */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {faq.question}
                  </h3>

                  {/* Answer */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    {faq.answer}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2">
                    {faq.highlights.map((highlight, hIndex) => (
                      <div key={hIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Contact our team today to discuss your pharmaceutical needs and
              discover how we can help you succeed in the global market.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => setIsCallDialogOpen(true)}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-300 text-sm sm:text-base"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Schedule a Call
              </button>
              <a
                href="https://wa.me/919664843790"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 hover:scale-105 active:scale-95 transition-all duration-300 text-sm sm:text-base"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Chat on WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Call Dialog */}
      {isCallDialogOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsCallDialogOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Choose a Number to Call
              </h3>
              <button
                onClick={() => setIsCallDialogOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {phoneNumbers.map((phone, index) => (
                <a
                  key={index}
                  href={phone.href}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
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
                </a>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Click on any number above to start the call
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Business Hours Dialog */}
      {isBusinessHoursDialogOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsBusinessHoursDialogOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Business Hours
              </h3>
              <button
                onClick={() => setIsBusinessHoursDialogOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-3 sm:p-4 space-y-3">
              {/* Operating Hours Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 sm:p-4 text-center border border-orange-200 dark:border-orange-700/30">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Operating Hours
                    </h4>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      IST (UTC +5:30)
                    </div>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  Mon - Sat: 9:00 AM - 6:00 PM
                </div>
              </div>

              {/* Current Status Card */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <h5 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  Current Status
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Time
                    </div>
                    <div className="text-xs font-mono font-semibold text-gray-900 dark:text-white">
                      {currentTime.toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Day
                    </div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {currentTime.toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        weekday: "short",
                      })}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </div>
                    <div
                      className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${(() => {
                        const istTime = new Date(
                          currentTime.toLocaleString("en-US", {
                            timeZone: "Asia/Kolkata",
                          })
                        );
                        const day = istTime.getDay();
                        const hour = istTime.getHours();
                        const isWeekday = day >= 1 && day <= 6;
                        const isBusinessHours = hour >= 9 && hour < 18;
                        return isWeekday && isBusinessHours
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                      })()}`}
                    >
                      {(() => {
                        const istTime = new Date(
                          currentTime.toLocaleString("en-US", {
                            timeZone: "Asia/Kolkata",
                          })
                        );
                        const day = istTime.getDay();
                        const hour = istTime.getHours();
                        const isWeekday = day >= 1 && day <= 6;
                        const isBusinessHours = hour >= 9 && hour < 18;
                        return isWeekday && isBusinessHours
                          ? "🟢 Open"
                          : "🔴 Closed";
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact Section */}
              <div>
                <h5 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  Quick Contact
                </h5>
                <div className="space-y-1.5">
                  {phoneNumbers.map((phone, index) => (
                    <a
                      key={index}
                      href={phone.href}
                      className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 rounded-lg hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Phone className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">
                          {phone.label}
                        </div>
                      </div>
                      <div className="text-primary-600 dark:text-primary-400 font-bold text-xs group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                        {phone.number}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/919664843790"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Chat on WhatsApp</span>
              </a>

              {/* Important Note */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-700/30">
                <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <strong className="font-semibold">📌</strong> Closed on
                  Sundays & holidays. For urgent matters, contact via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
