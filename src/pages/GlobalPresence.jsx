import React, {
  useMemo,
  memo,
  lazy,
  Suspense,
  useState,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  MapPin,
  Users,
  Building,
  Award,
  X,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import globalReachImage from "../assets/images/global reach.png";
import globalHeaderImage from "../assets/images/global.png";

// Lazy load the WorldMap component
const WorldMap = lazy(() => import("../components/ui/world-map"));

// Memoized components for better performance
const StatCard = memo(({ stat, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ scale: 1.05 }}
    className="text-center group"
  >
    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
      <stat.icon className="w-8 h-8 text-white" />
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      {stat.value}
    </div>
    <div className="text-gray-600 dark:text-gray-300 text-sm">{stat.label}</div>
  </motion.div>
));

const RegionCard = memo(({ region, variants }) => (
  <motion.div
    variants={variants}
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
));

const FeatureItem = memo(({ feature, index }) => (
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
    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
  </motion.div>
));

const GlobalPresence = memo(() => {
  const { t } = useTranslation();
  const [loadStage, setLoadStage] = useState(0);
  const [showPartnershipDialog, setShowPartnershipDialog] = useState(false);

  // Contact handlers
  const handleCall = () => {
    window.location.href = "tel:+919664843790";
  };

  const handleEmail = () => {
    window.location.href =
      "mailto:Info@nexlifeinternational.com?subject=Partnership Inquiry&body=Hello, I am interested in exploring partnership opportunities with Nexlife International.";
  };

  const handleWhatsApp = () => {
    const message =
      "Hello, I am interested in exploring partnership opportunities with Nexlife International.";
    window.open(
      `https://wa.me/919664843790?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Progressive loading stages
  useEffect(() => {
    // Stage 1: Load immediately
    setLoadStage(1);

    // Stage 2: Load after 100ms
    const timer1 = setTimeout(() => setLoadStage(2), 100);

    // Stage 3: Load after 300ms
    const timer2 = setTimeout(() => setLoadStage(3), 300);

    // Stage 4: Load after 500ms
    const timer3 = setTimeout(() => setLoadStage(4), 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Memoize static data to prevent re-creation on every render
  const regions = useMemo(
    () => [
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
    ],
    []
  );

  const stats = useMemo(
    () => [
      { icon: Globe, label: "Countries Served", value: "50+" },
      { icon: Users, label: "Healthcare Partners", value: "1000+" },
      { icon: Award, label: "Years Experience", value: "15+" },
      { icon: Building, label: "Quality Assurance", value: "99.9%" },
    ],
    []
  );

  // Memoize animation variants to prevent re-creation
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1, // Reduced stagger for faster animation
        },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4, // Reduced duration for snappier animations
        },
      },
    }),
    []
  );

  // Memoize map connections data
  const mapConnections = useMemo(
    () => [
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
        end: { lat: 35.9078, lng: 127.7669, label: "South Korea" },
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
        start: { lat: 23.8859, lng: 45.0792, label: "Saudi Arabia" },
        end: { lat: 26.0975, lng: 30.0444, label: "Egypt" },
      },
      // Africa connections
      {
        start: { lat: -30.5595, lng: 22.9375, label: "South Africa" },
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
    ],
    []
  );

  // Memoize features data
  const features = useMemo(
    () => [
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
    ],
    []
  );

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

      {/* Stats Section - Simplified for faster loading */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Map Visualization - Load in stage 3+ */}
      {loadStage >= 3 && (
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-custom">
            {/* Interactive World Map */}
            <div className="relative max-w-6xl mx-auto">
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

              {/* Map container with skeleton loading */}
              <div className="w-full rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg bg-white">
                <Suspense
                  fallback={
                    <div className="w-full aspect-[2/1] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                      {/* Skeleton Map Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20"></div>

                      {/* Skeleton World Map Shape */}
                      <div className="absolute inset-4">
                        <svg viewBox="0 0 800 400" className="w-full h-full">
                          {/* Skeleton continents */}
                          <g
                            fill="currentColor"
                            className="text-gray-200 dark:text-gray-700"
                          >
                            {/* North America */}
                            <path d="M100 80 Q120 60 140 80 Q160 100 180 90 Q200 70 220 80 Q240 90 260 85 Q280 75 300 80 Q320 85 340 80 Q360 75 380 80 Q400 85 420 80 Q440 75 460 80 Q480 85 500 80 Q520 75 540 80 Q560 85 580 80 Q600 75 620 80 Q640 85 660 80 Q680 75 700 80 Q720 85 740 80 Q760 75 780 80 Q800 85 800 100 L800 120 Q780 140 760 120 Q740 100 720 120 Q700 140 680 120 Q660 100 640 120 Q620 140 600 120 Q580 100 560 120 Q540 140 520 120 Q500 100 480 120 Q460 140 440 120 Q420 100 400 120 Q380 140 360 120 Q340 100 320 120 Q300 140 280 120 Q260 100 240 120 Q220 140 200 120 Q180 100 160 120 Q140 140 120 120 Q100 100 100 80 Z" />

                            {/* Europe */}
                            <path d="M350 120 Q370 100 390 120 Q410 140 430 120 Q450 100 470 120 Q490 140 510 120 Q530 100 550 120 Q570 140 590 120 Q610 100 630 120 Q650 140 670 120 Q690 100 710 120 Q730 140 750 120 Q770 100 790 120 Q800 140 800 160 Q780 180 760 160 Q740 140 720 160 Q700 180 680 160 Q660 140 640 160 Q620 180 600 160 Q580 140 560 160 Q540 180 520 160 Q500 140 480 160 Q460 180 440 160 Q420 140 400 160 Q380 180 360 160 Q340 140 350 120 Z" />

                            {/* Asia */}
                            <path d="M500 100 Q520 80 540 100 Q560 120 580 100 Q600 80 620 100 Q640 120 660 100 Q680 80 700 100 Q720 120 740 100 Q760 80 780 100 Q800 120 800 140 Q780 160 760 140 Q740 120 720 140 Q700 160 680 140 Q660 120 640 140 Q620 160 600 140 Q580 120 560 140 Q540 160 520 140 Q500 120 500 100 Z" />

                            {/* Africa */}
                            <path d="M350 200 Q370 180 390 200 Q410 220 430 200 Q450 180 470 200 Q490 220 510 200 Q530 180 550 200 Q570 220 590 200 Q610 180 630 200 Q650 220 670 200 Q690 180 710 200 Q730 220 750 200 Q770 180 790 200 Q800 220 800 240 Q780 260 760 240 Q740 220 720 240 Q700 260 680 240 Q660 220 640 240 Q620 260 600 240 Q580 220 560 240 Q540 260 520 240 Q500 220 480 240 Q460 260 440 240 Q420 220 400 240 Q380 260 360 240 Q340 220 350 200 Z" />

                            {/* South America */}
                            <path d="M200 250 Q220 230 240 250 Q260 270 280 250 Q300 230 320 250 Q340 270 360 250 Q380 230 400 250 Q420 270 440 250 Q460 230 480 250 Q500 270 520 250 Q540 230 560 250 Q580 270 600 250 Q620 230 640 250 Q660 270 680 250 Q700 230 720 250 Q740 270 760 250 Q780 230 800 250 Q800 270 800 290 Q780 310 760 290 Q740 270 720 290 Q700 310 680 290 Q660 270 640 290 Q620 310 600 290 Q580 270 560 290 Q540 310 520 290 Q500 270 480 290 Q460 310 440 290 Q420 270 400 290 Q380 310 360 290 Q340 270 320 290 Q300 310 280 290 Q260 270 240 290 Q220 310 200 290 Q200 270 200 250 Z" />

                            {/* Australia */}
                            <path d="M600 300 Q620 280 640 300 Q660 320 680 300 Q700 280 720 300 Q740 320 760 300 Q780 280 800 300 Q800 320 800 340 Q780 360 760 340 Q740 320 720 340 Q700 360 680 340 Q660 320 640 340 Q620 360 600 340 Q600 320 600 300 Z" />
                          </g>

                          {/* Skeleton connection lines */}
                          <g
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-300 dark:text-gray-600 opacity-50"
                          >
                            <path
                              d="M200 150 Q300 200 400 180 Q500 160 600 190 Q700 220 800 200"
                              fill="none"
                              strokeDasharray="5,5"
                            >
                              <animate
                                attributeName="stroke-dashoffset"
                                values="0;10"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </path>
                            <path
                              d="M300 200 Q400 250 500 230 Q600 210 700 240"
                              fill="none"
                              strokeDasharray="5,5"
                            >
                              <animate
                                attributeName="stroke-dashoffset"
                                values="0;10"
                                dur="2.5s"
                                repeatCount="indefinite"
                              />
                            </path>
                            <path
                              d="M400 180 Q500 230 600 210 Q700 190 800 220"
                              fill="none"
                              strokeDasharray="5,5"
                            >
                              <animate
                                attributeName="stroke-dashoffset"
                                values="0;10"
                                dur="3s"
                                repeatCount="indefinite"
                              />
                            </path>
                          </g>

                          {/* Skeleton connection points */}
                          <g
                            fill="currentColor"
                            className="text-blue-400 dark:text-blue-500"
                          >
                            <circle cx="200" cy="150" r="4" opacity="0.6">
                              <animate
                                attributeName="opacity"
                                values="0.6;1;0.6"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </circle>
                            <circle cx="400" cy="180" r="4" opacity="0.6">
                              <animate
                                attributeName="opacity"
                                values="0.6;1;0.6"
                                dur="2.2s"
                                repeatCount="indefinite"
                              />
                            </circle>
                            <circle cx="600" cy="190" r="4" opacity="0.6">
                              <animate
                                attributeName="opacity"
                                values="0.6;1;0.6"
                                dur="2.4s"
                                repeatCount="indefinite"
                              />
                            </circle>
                            <circle cx="800" cy="200" r="4" opacity="0.6">
                              <animate
                                attributeName="opacity"
                                values="0.6;1;0.6"
                                dur="2.6s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </g>
                        </svg>
                      </div>

                      {/* Loading indicator */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full shadow-lg">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            Preparing interactive map...
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <WorldMap dots={mapConnections} lineColor="#3B82F6" />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regional Breakdown - Load in stage 2+ */}
      {loadStage >= 2 && (
        <section className="section-padding bg-white dark:bg-gray-900">
          <div className="container-custom">
            <div className="text-center mb-16">
              <div className="inline-block mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 inline-block">
                  Regional Presence
                </h2>
                <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our presence across different regions and the countries
                we serve.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regions.map((region) => (
                <RegionCard
                  key={region.name}
                  region={region}
                  variants={itemVariants}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regional Breakdown Skeleton - Show while loading */}
      {loadStage < 2 && (
        <section className="section-padding bg-white dark:bg-gray-900">
          <div className="container-custom">
            <div className="text-center mb-16">
              <div className="inline-block mx-auto">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-80 mx-auto mb-4 animate-pulse"></div>
                <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Global Operations - Load in stage 4+ */}
      {loadStage >= 4 && (
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Global Operations & Infrastructure
                </h2>
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <FeatureItem
                      key={feature.title}
                      feature={feature}
                      index={index}
                    />
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 p-4">
                  <img
                    src={globalReachImage}
                    alt="Global Operations & Infrastructure - Global Reach"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Global Operations Skeleton - Show while loading */}
      {loadStage < 4 && loadStage >= 3 && (
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-80 mb-6 animate-pulse"></div>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Load immediately */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-custom text-center">
          <div>
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
              onClick={() => setShowPartnershipDialog(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transform transition-all duration-300 hover:scale-105"
            >
              Explore Partnership Opportunities
            </motion.button>
          </div>
        </div>
      </section>

      {/* Partnership Dialog */}
      <AnimatePresence>
        {showPartnershipDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPartnershipDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Partnership Opportunities
                </h3>
                <button
                  onClick={() => setShowPartnershipDialog(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Ready to explore partnership opportunities with Nexlife
                International? Choose your preferred way to get in touch with
                our team.
              </p>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCall}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Us</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmail}
                  className="w-full flex items-center justify-center space-x-3 bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Send Email</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center space-x-3 bg-green-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  +91 96648 43790 | Info@nexlifeinternational.com
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default GlobalPresence;
