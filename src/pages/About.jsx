import React, { useEffect, useRef, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Globe,
  Plus,
  Minus,
} from "lucide-react";
import aboutUsImage from "../assets/images/about_us.png";

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
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────  CountUp  ───────────────────────── */
const AnimatedCounter = memo(({ end, suffix = "", duration = 2000 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.floor(end * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
});

/* ─────────────────────────  Expandable Card  ───────────────────────── */
const ExpandableCard = ({ icon, title, summary, children, isExpanded, onToggle, delay = 0 }) => {
  return (
    <FadeIn delay={delay}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src={icon}
                alt={title}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {isExpanded ? (
              <Minus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {summary}
          </p>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-4 pt-2">{children}</div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

/* ═══════════════════════════  MAIN COMPONENT  ═══════════════════════════ */
const About = () => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState(null);

  const values = [
    {
      image: "/ICONS/ABOUT US - QUALITY.png",
      title: "Quality",
      description:
        "We maintain the highest standards in all our products and services.",
    },
    {
      image: "/ICONS/ABOUT US - INTEGRITY.png",
      title: "Integrity",
      description:
        "We conduct business with honesty, transparency, and ethical practices.",
    },
    {
      image: "/ICONS/ABOUT US - INOVATION.png",
      title: "Innovation",
      description:
        "We continuously innovate to improve healthcare solutions worldwide.",
    },
    {
      image: "/ICONS/ABOUT US -GLOBAL PARTNER.png",
      title: "Global Partnership",
      description:
        "We build lasting relationships with partners across the globe.",
    },
  ];

  const stats = [
    { target: 50, suffix: "+", label: "Countries Served" },
    { target: 1000, suffix: "+", label: "Healthcare Partners" },
    { target: 15, suffix: "+", label: "Years Experience" },
    { target: 99, suffix: ".9%", label: "Quality Assurance" },
  ];

  const certifications = [
    "WHO-GMP",
    "ISO 9001:2015",
    "ISO 13485:2016",
    "CE",
    "FSSAI",
    "Halal",
    "HACCP",
  ];

  const regions = [
    {
      name: "Asia",
      countries:
        "Afghanistan, Azerbaijan, Bhutan, Cambodia, Iraq, Jordan, Myanmar, Nepal, Philippines, Sri Lanka, Turkey",
      icon: Globe,
    },
    {
      name: "Africa",
      countries:
        "Angola, Benin, Ghana, Kenya, Malawi, Mali, Mauritius, Mozambique, Nigeria, Somalia, South Sudan, Tanzania, Togo, Uganda",
      icon: Globe,
    },
    {
      name: "Europe",
      countries: "Belarus, Latvia",
      icon: Globe,
    },
    {
      name: "South America",
      countries: "Chile, Venezuela, Peru",
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative">
        <FadeIn>
          <div className="relative w-full">
            <img
              src={aboutUsImage}
              alt="About Nexlife International"
              className="w-full h-[32vh] sm:h-[38vh] md:h-[44vh] lg:h-[48vh] object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
            <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6">
              <div className="text-center max-w-3xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-lg">
                  {t("aboutTitle")}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                  {t("aboutSubtitle")}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Who We Are ── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                About Us
              </h2>
              <div className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            {/* Text content — 3 cols */}
            <FadeIn className="lg:col-span-3">
              <div className="space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed text-[15px] sm:text-base">
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  NEXLIFE INTERNATIONAL – a trusted name in the global
                  Pharmaceutical &amp; Healthcare industry – is headquartered in
                  Surat, Gujarat, India.
                </p>
                <p>
                  We are recognized worldwide for our commitment to quality,
                  innovation, and product effectiveness. Our world-class
                  facilities ensure adherence to the highest international
                  standards.
                </p>
                <p>
                  With 500+ formulations registered globally and backed by strong
                  regulatory expertise, we deliver a diverse portfolio of
                  pharmaceutical solutions. Leveraging cutting-edge technology and
                  premium raw materials, we manufacture a wide range of dosage
                  forms including:
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-[15px] text-gray-700 dark:text-gray-300">
                  {[
                    "Tablets, capsules & injections",
                    "Pre-filled syringes & inhalers",
                    "Nasal sprays & suspensions",
                    "Creams, ointments & eye/ear drops",
                    "Syrups & dry syrups",
                    "Sachets, powders & lozenges",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p>
                  Every product is developed under the supervision of highly
                  skilled professionals to guarantee efficacy, safety, and
                  reliability. Along with competitive pricing and on-time
                  delivery, we are equipped to meet both urgent and bulk
                  requirements with efficiency.
                </p>
              </div>
            </FadeIn>

            {/* Certifications sidebar — 2 cols */}
            <FadeIn delay={150} className="lg:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-500" />
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700/40"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Our facilities are certified to the highest international
                    quality &amp; safety standards, ensuring every product meets
                    rigorous global benchmarks.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <FadeIn>
            <div className="text-center mb-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Mission &amp; Vision
              </h2>
              <div className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
            </div>
          </FadeIn>

          <ExpandableCard
            icon="/ICONS/goal.png"
            title="Mission"
            summary="At Nexlife International, our mission is to enhance global health by offering innovative, affordable, and high-quality pharmaceutical solutions that align with international standards."
            isExpanded={expandedSection === "mission"}
            onToggle={() =>
              setExpandedSection(
                expandedSection === "mission" ? null : "mission"
              )
            }
          >
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We are driven by a commitment to excellence, using premium-grade
              materials and upholding uncompromising ethical and quality
              practices. Our ambition is to be a leader in the pharmaceutical
              industry through continuous advancement of our product portfolio,
              ensuring accessible and effective healthcare for all.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Customer trust and satisfaction are at the heart of what we do. By
              ensuring authenticity, timely delivery, and full regulatory
              compliance, we strive to build long-term relationships and make a
              meaningful impact in the lives of patients worldwide.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
              Nexlife International is dedicated to redefining healthcare—one
              trusted solution at a time.
            </p>
          </ExpandableCard>

          <ExpandableCard
            icon="/ICONS/focus.png"
            title="Vision"
            summary="At Nexlife International, our vision is to expand global access to high-quality, affordable medicines through innovation and a steadfast commitment to excellence in pharmaceutical manufacturing."
            isExpanded={expandedSection === "vision"}
            onToggle={() =>
              setExpandedSection(
                expandedSection === "vision" ? null : "vision"
              )
            }
            delay={150}
          >
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We aim to be a trusted leader in the international market by
              providing tailored healthcare solutions that address the diverse
              needs of our clients. Upholding the highest standards of quality
              and compliance, we are driven by a strong ethical foundation that
              ensures fairness, integrity, and transparency in every aspect of
              our operations.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
              At Nexlife International, we don't just manufacture medicines—we
              build trust, improve lives, and set new standards for a healthier
              future.
            </p>
          </ExpandableCard>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {t("values")}
              </h2>
              <div className="h-1 w-16 mx-auto mb-5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t("valuesText")}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, i) => (
              <FadeIn key={value.title} delay={i * 100}>
                <div className="text-center group bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={value.image}
                      alt={value.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Global Presence ── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Our Global Presence
              </h2>
              <div className="h-1 w-16 mx-auto mb-5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                We proudly export to clients across Asia, Africa, Europe, and
                South America.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {regions.map((region, i) => (
              <FadeIn key={region.name} delay={i * 80}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                      <region.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {region.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {region.countries}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 sm:py-16 lg:py-20 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 100}>
                <div className="group">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1.5 group-hover:scale-105 transition-transform duration-300 inline-block">
                    <AnimatedCounter end={stat.target} suffix={stat.suffix} />
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm md:text-base font-medium">
                    {stat.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
