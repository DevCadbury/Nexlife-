import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe, MapPin, Users, Building, Award } from "lucide-react";
import globalReachImage from "../assets/images/global reach.png";
import globalHeaderImage from "../assets/images/global.png";
import WorldMap from "../components/ui/world-map";

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
      <section className="relative pt-0 pb-20 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full"
        >
          <img
            src={globalHeaderImage}
            alt="Global Presence"
            className="w-full h-[38vh] sm:h-[44vh] md:h-[52vh] lg:h-[60vh] object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/20" />
          {/* Text overlay with tile UI */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                Global Presence
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                Serving healthcare providers worldwide
              </p>
            </div>
          </div>
        </motion.div>
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
          {/* Interactive World Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-6xl mx-auto"
          >
            {/* Text section above the map */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-2xl">
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-wide">
                    Our Global Network
                  </h3>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-blue-500 mx-auto mb-4 rounded-full"></div>
                  <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                    We have established a strong presence across major
                    pharmaceutical markets worldwide, serving healthcare
                    providers with quality products and reliable services.
                  </p>
                </div>
              </div>
            </div>

            {/* Map container */}
            <div className="w-full rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg bg-white">
              <WorldMap
                dots={[
                  // North America connections
                  {
                    start: { lat: 39.8283, lng: -98.5795, label: "USA" },
                    end: { lat: 51.1657, lng: 10.4515, label: "Germany" },
                  },
                  {
                    start: { lat: 39.8283, lng: -98.5795, label: "USA" },
                    end: { lat: 20.5937, lng: 78.9629, label: "India" },
                  },
                  {
                    start: { lat: 56.1304, lng: -106.3468, label: "Canada" },
                    end: { lat: 55.3781, lng: -3.436, label: "UK" },
                  },

                  // Europe connections
                  {
                    start: { lat: 55.3781, lng: -3.436, label: "UK" },
                    end: {
                      lat: 35.9078,
                      lng: 127.7669,
                      label: "South Korea",
                    },
                  },
                  {
                    start: { lat: 51.1657, lng: 10.4515, label: "Germany" },
                    end: { lat: 35.8617, lng: 104.1954, label: "China" },
                  },
                  {
                    start: { lat: 46.2276, lng: 2.2137, label: "France" },
                    end: { lat: -25.2744, lng: 133.7751, label: "Australia" },
                  },

                  // Asia Pacific connections
                  {
                    start: { lat: 20.5937, lng: 78.9629, label: "India" },
                    end: { lat: 1.3521, lng: 103.8198, label: "Singapore" },
                  },
                  {
                    start: { lat: 35.8617, lng: 104.1954, label: "China" },
                    end: { lat: 36.2048, lng: 138.2529, label: "Japan" },
                  },
                  {
                    start: { lat: 1.3521, lng: 103.8198, label: "Singapore" },
                    end: { lat: -14.235, lng: -51.9253, label: "Brazil" },
                  },

                  // Middle East connections
                  {
                    start: { lat: 23.4241, lng: 53.8478, label: "UAE" },
                    end: { lat: 31.0461, lng: 34.8516, label: "Israel" },
                  },
                  {
                    start: {
                      lat: 23.8859,
                      lng: 45.0792,
                      label: "Saudi Arabia",
                    },
                    end: { lat: 26.0975, lng: 30.0444, label: "Egypt" },
                  },

                  // Africa connections
                  {
                    start: {
                      lat: -30.5595,
                      lng: 22.9375,
                      label: "South Africa",
                    },
                    end: { lat: 9.082, lng: 8.6753, label: "Nigeria" },
                  },
                  {
                    start: { lat: 9.082, lng: 8.6753, label: "Nigeria" },
                    end: { lat: 7.9465, lng: -1.0232, label: "Ghana" },
                  },

                  // Latin America connections
                  {
                    start: { lat: -14.235, lng: -51.9253, label: "Brazil" },
                    end: { lat: -38.4161, lng: -63.6167, label: "Argentina" },
                  },
                  {
                    start: { lat: -35.6751, lng: -71.543, label: "Chile" },
                    end: { lat: 4.5709, lng: -74.2973, label: "Colombia" },
                  },
                ]}
                lineColor="#3B82F6"
              />
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
            <div className="inline-block mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 inline-block">
                Regional Presence
              </h2>
              <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
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
                className="card p-6 group border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-300"
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
