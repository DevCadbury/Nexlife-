import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, animate, useMotionValue } from "framer-motion";
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

const About = () => {
  const { t } = useTranslation();
  const [expandedMission, setExpandedMission] = useState(false);
  const [expandedVision, setExpandedVision] = useState(false);

  const values = [
    {
      icon: Target,
      title: "Quality",
      description:
        "We maintain the highest standards in all our products and services.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Heart,
      title: "Integrity",
      description:
        "We conduct business with honesty, transparency, and ethical practices.",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Users,
      title: "Innovation",
      description:
        "We continuously innovate to improve healthcare solutions worldwide.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Globe,
      title: "Global Partnership",
      description:
        "We build lasting relationships with partners across the globe.",
      color: "from-green-500 to-green-600",
    },
  ];

  const stats = [
    { target: 50, suffix: "+", label: "Countries Served" },
    { target: 1000, suffix: "+", label: "Healthcare Partners" },
    { target: 15, suffix: "+", label: "Years Experience" },
    { target: 99, suffix: ".9%", label: "Quality Assurance" },
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

  const StatItem = ({ target, suffix = "", label }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const motionValue = useMotionValue(0);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      const controls = motionValue.on("change", (v) =>
        setDisplay(Math.floor(v))
      );
      return () => controls();
    }, [motionValue]);

    useEffect(() => {
      if (isInView) {
        animate(motionValue, target, { duration: 2, ease: "easeOut" });
      }
    }, [isInView, motionValue, target]);

    return (
      <motion.div
        ref={ref}
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        className="group"
      >
        <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
          {display}
          {suffix}
        </div>
        <div className="text-white/90 text-sm md:text-base font-medium">
          {label}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pt-0">
      {/* Hero Section */}
      <section className="relative pt-0 pb-12 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full"
        >
          <img
            src={aboutUsImage}
            alt="About Us"
            className="w-full h-[25vh] sm:h-[30vh] md:h-[35vh] lg:h-[40vh] object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/20" />
          {/* Text overlay with tile UI */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                {t("aboutTitle")}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                {t("aboutSubtitle")}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* About Us Content */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                About Us
              </h2>
              <div className="h-1 w-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>

            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 leading-relaxed space-y-6 border border-gray-200 dark:border-gray-700 rounded-xl p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                NEXLIFE INTERNATIONAL – a trusted name in the global
                Pharmaceutical & Healthcare industry – is headquartered in
                Surat, Gujarat, India.
              </p>

              <p>
                We are recognized worldwide for our commitment to quality,
                innovation, and product effectiveness. Our world-class
                facilities are certified with WHO-GMP, ISO 9001:2015, ISO
                13485:2016, CE, FSSAI, Halal, and HACCP, ensuring adherence to
                the highest international standards.
              </p>

              <p>
                With 500+ formulations registered globally and backed by strong
                regulatory expertise, we deliver a diverse portfolio of
                pharmaceutical solutions. Leveraging cutting-edge technology and
                premium raw materials, we manufacture a wide range of dosage
                forms including:
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 my-6">
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">
                      •
                    </span>
                    <span>Tablets, capsules, and injections</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">
                      •
                    </span>
                    <span>Pre-filled syringes, inhalers, and nasal sprays</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">
                      •
                    </span>
                    <span>
                      Creams, ointments, eye/ear drops, syrups, and suspensions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">
                      •
                    </span>
                    <span>
                      Sachets, powders, lozenges, jellies, and lotions
                    </span>
                  </li>
                </ul>
              </div>

              <p>
                Every product is developed under the supervision of highly
                skilled professionals to guarantee efficacy, safety, and
                reliability. Along with competitive pricing and on-time
                delivery, we are equipped to meet both urgent and bulk
                requirements with efficiency.
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Global Presence
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We proudly export to clients across Asia, Africa, Europe, and
                  South America.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Asia
                    </h4>
                    <p className="text-sm">
                      Afghanistan, Azerbaijan, Bhutan, Cambodia, Iraq, Jordan,
                      Myanmar, Nepal, Philippines, Sri Lanka, Turkey
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Africa
                    </h4>
                    <p className="text-sm">
                      Angola, Benin, Ghana, Kenya, Malawi, Mali, Mauritius,
                      Mozambique, Nigeria, Somalia, South Sudan, Tanzania, Togo,
                      Uganda
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Europe
                    </h4>
                    <p className="text-sm">Belarus, Latvia</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      South America
                    </h4>
                    <p className="text-sm">Chile, Venezuela, Peru</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Mission
                  </h3>
                </div>
                <button
                  onClick={() => setExpandedMission(!expandedMission)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {expandedMission ? (
                    <Minus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  At Nexlife International, our mission is to enhance global
                  health by offering innovative, affordable, and high-quality
                  pharmaceutical solutions that align with international
                  standards.
                </p>

                {expandedMission && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      We are driven by a commitment to excellence, using
                      premium-grade materials and upholding uncompromising
                      ethical and quality practices. Our ambition is to be a
                      leader in the pharmaceutical industry through continuous
                      advancement of our product portfolio, ensuring accessible
                      and effective healthcare for all.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Customer trust and satisfaction are at the heart of what
                      we do. By ensuring authenticity, timely delivery, and full
                      regulatory compliance, we strive to build long-term
                      relationships and make a meaningful impact in the lives of
                      patients worldwide.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                      Nexlife International is dedicated to redefining
                      healthcare—one trusted solution at a time.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Vision
                  </h3>
                </div>
                <button
                  onClick={() => setExpandedVision(!expandedVision)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {expandedVision ? (
                    <Minus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  At Nexlife International, our mission is to expand global
                  access to high-quality, affordable medicines through
                  innovation and a steadfast commitment to excellence in
                  pharmaceutical manufacturing.
                </p>

                {expandedVision && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      We aim to be a trusted leader in the international market
                      by providing tailored healthcare solutions that address
                      the diverse needs of our clients. Upholding the highest
                      standards of quality and compliance, we are driven by a
                      strong ethical foundation that ensures fairness,
                      integrity, and transparency in every aspect of our
                      operations.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                      At Nexlife International, we don't just manufacture
                      medicines—we build trust, improve lives, and set new
                      standards for a healthier future.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mx-auto">
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 inline-block"
              >
                {t("values")}
              </motion.h2>
              <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              {t("valuesText")}
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="text-center group border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-300"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {stats.map((stat) => (
              <StatItem
                key={stat.label}
                target={stat.target}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
