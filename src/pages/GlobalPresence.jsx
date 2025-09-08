import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe, MapPin, Users, Building, Award } from "lucide-react";
import globalReachImage from "../assets/images/global reach.png";

const GlobalPresence = () => {
  const { t } = useTranslation();

  const regions = [
    {
      name: "North America",
      countries: ["United States", "Canada", "Mexico"],
      count: 3,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Europe",
      countries: [
        "United Kingdom",
        "Germany",
        "France",
        "Italy",
        "Spain",
        "Netherlands",
        "Switzerland",
        "Sweden",
      ],
      count: 8,
      color: "from-green-500 to-green-600",
    },
    {
      name: "Asia Pacific",
      countries: [
        "India",
        "China",
        "Japan",
        "South Korea",
        "Australia",
        "Singapore",
        "Thailand",
        "Malaysia",
      ],
      count: 8,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Middle East",
      countries: ["UAE", "Saudi Arabia", "Israel", "Turkey", "Egypt"],
      count: 5,
      color: "from-orange-500 to-orange-600",
    },
    {
      name: "Latin America",
      countries: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"],
      count: 5,
      color: "from-red-500 to-red-600",
    },
    {
      name: "Africa",
      countries: ["South Africa", "Nigeria", "Kenya", "Ghana", "Morocco"],
      count: 5,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  const stats = [
    { icon: Globe, label: "Countries Served", value: "50+" },
    { icon: Users, label: "Healthcare Partners", value: "1000+" },
    { icon: Award, label: "Years Experience", value: "15+" },
    { icon: Building, label: "Quality Assurance", value: "99.9%" },
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
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t("globalTitle")}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("globalSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* World Map Visualization */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Global Network
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We have established a strong presence across major pharmaceutical
              markets worldwide, serving healthcare providers with quality
              products and reliable services.
            </p>
          </motion.div>

          {/* Simplified World Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* World Map Placeholder */}
              <div className="text-center">
                <Globe className="w-48 h-48 text-primary-500 dark:text-primary-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Global Pharmaceutical Network
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Serving 50+ countries with pharmaceutical solutions
                </p>
              </div>

              {/* Floating Region Indicators */}
              {regions.map((region, index) => (
                <motion.div
                  key={region.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`absolute w-4 h-4 bg-gradient-to-r ${region.color} rounded-full shadow-lg animate-pulse`}
                  style={{
                    top: `${20 + index * 15}%`,
                    left: `${15 + index * 12}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Regional Breakdown */}
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
              Regional Presence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our presence across different regions and the countries we
              serve.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {regions.map((region) => (
              <motion.div
                key={region.name}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="card p-6 group"
              >
                <div
                  className={`w-16 h-16 mb-4 rounded-xl bg-gradient-to-r ${region.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {region.name}
                </h3>
                <div className="text-2xl font-bold text-primary-500 mb-4">
                  {region.count} Countries
                </div>
                <div className="space-y-2">
                  {region.countries.map((country) => (
                    <div
                      key={country}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
                    >
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-sm">{country}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Global Operations */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Global Operations & Infrastructure
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Strategic Distribution Centers",
                    description:
                      "25+ strategically located distribution centers ensuring fast and reliable delivery worldwide.",
                  },
                  {
                    title: "Local Partnerships",
                    description:
                      "Strong partnerships with local pharmaceutical companies and healthcare providers in each region.",
                  },
                  {
                    title: "Regulatory Expertise",
                    description:
                      "Deep understanding of local regulations and compliance requirements across all markets.",
                  },
                  {
                    title: "24/7 Support",
                    description:
                      "Round-the-clock customer support and technical assistance in multiple languages.",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 p-4">
                <img
                  src={globalReachImage}
                  alt="Global Operations & Infrastructure - Global Reach"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </div>
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
              Partner With Us Globally
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you're in North America, Europe, Asia, or anywhere else in
              the world, we're here to serve your pharmaceutical needs with our
              global expertise and local knowledge.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transform transition-all duration-300"
            >
              Explore Partnership Opportunities
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default GlobalPresence;
