import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, animate, useMotionValue } from "framer-motion";
import { Target, Eye, Heart, Users, Award, Globe } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

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
    <div className="min-h-screen pt-32">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t("aboutTitle")}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("aboutSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Description */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t("aboutDescription")}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Founded with a vision to bridge healthcare gaps globally, we
                have grown from a local pharmaceutical company to an
                international leader in pharmaceutical trade and distribution.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="w-full h-80 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl flex items-center justify-center">
                <Award className="w-32 h-32 text-primary-500 dark:text-primary-400" />
              </div>
            </motion.div>
          </div>
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
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t("mission")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t("missionText")}
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t("vision")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t("visionText")}
              </p>
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
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {t("values")}
            </motion.h2>
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
                className="text-center group"
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
