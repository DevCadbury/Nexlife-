import React, {
  useMemo,
  memo,
  useState,
  useEffect,
  useCallback,
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
import { WorldMap } from "react-svg-worldmap";
import globalReachImage from "../assets/images/global reach.png";
import globalHeaderImage from "../assets/images/global.png";

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
    <div className="flex flex-col items-center text-center">
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
  const [clickedCountry, setClickedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  // Map data with all countries we serve
  const mapData = useMemo(() => [
    // North America
    { country: "us", value: 1, name: "United States", region: "North America" },
    { country: "ca", value: 1, name: "Canada", region: "North America" },
    { country: "mx", value: 1, name: "Mexico", region: "North America" },
    
    // Europe
    { country: "gb", value: 1, name: "United Kingdom", region: "Europe" },
    { country: "de", value: 1, name: "Germany", region: "Europe" },
    { country: "fr", value: 1, name: "France", region: "Europe" },
    { country: "it", value: 1, name: "Italy", region: "Europe" },
    { country: "es", value: 1, name: "Spain", region: "Europe" },
    { country: "nl", value: 1, name: "Netherlands", region: "Europe" },
    { country: "ch", value: 1, name: "Switzerland", region: "Europe" },
    { country: "se", value: 1, name: "Sweden", region: "Europe" },
    
    // Asia Pacific
    { country: "in", value: 1, name: "India", region: "Asia Pacific" },
    { country: "cn", value: 1, name: "China", region: "Asia Pacific" },
    { country: "jp", value: 1, name: "Japan", region: "Asia Pacific" },
    { country: "kr", value: 1, name: "South Korea", region: "Asia Pacific" },
    { country: "au", value: 1, name: "Australia", region: "Asia Pacific" },
    { country: "sg", value: 1, name: "Singapore", region: "Asia Pacific" },
    { country: "th", value: 1, name: "Thailand", region: "Asia Pacific" },
    { country: "my", value: 1, name: "Malaysia", region: "Asia Pacific" },
    
    // Middle East
    { country: "ae", value: 1, name: "UAE", region: "Middle East" },
    { country: "sa", value: 1, name: "Saudi Arabia", region: "Middle East" },
    { country: "il", value: 1, name: "Israel", region: "Middle East" },
    { country: "tr", value: 1, name: "Turkey", region: "Middle East" },
    { country: "eg", value: 1, name: "Egypt", region: "Middle East" },
    
    // Latin America
    { country: "br", value: 1, name: "Brazil", region: "Latin America" },
    { country: "ar", value: 1, name: "Argentina", region: "Latin America" },
    { country: "cl", value: 1, name: "Chile", region: "Latin America" },
    { country: "co", value: 1, name: "Colombia", region: "Latin America" },
    { country: "pe", value: 1, name: "Peru", region: "Latin America" },
    
    // Africa
    { country: "za", value: 1, name: "South Africa", region: "Africa" },
    { country: "ng", value: 1, name: "Nigeria", region: "Africa" },
    { country: "ke", value: 1, name: "Kenya", region: "Africa" },
    { country: "gh", value: 1, name: "Ghana", region: "Africa" },
    { country: "ma", value: 1, name: "Morocco", region: "Africa" },
  ], []);

  // Create country lookup map
  const countryLookup = useMemo(() => {
    const lookup = {};
    mapData.forEach(item => {
      lookup[item.country] = item;
    });
    return lookup;
  }, [mapData]);

  // Comprehensive country name mapping for all countries
  const countryNames = useMemo(() => ({
    'af': 'Afghanistan', 'al': 'Albania', 'dz': 'Algeria', 'ad': 'Andorra', 'ao': 'Angola',
    'ag': 'Antigua and Barbuda', 'ar': 'Argentina', 'am': 'Armenia', 'au': 'Australia', 'at': 'Austria',
    'az': 'Azerbaijan', 'bs': 'Bahamas', 'bh': 'Bahrain', 'bd': 'Bangladesh', 'bb': 'Barbados',
    'by': 'Belarus', 'be': 'Belgium', 'bz': 'Belize', 'bj': 'Benin', 'bt': 'Bhutan',
    'bo': 'Bolivia', 'ba': 'Bosnia and Herzegovina', 'bw': 'Botswana', 'br': 'Brazil', 'bn': 'Brunei',
    'bg': 'Bulgaria', 'bf': 'Burkina Faso', 'bi': 'Burundi', 'kh': 'Cambodia', 'cm': 'Cameroon',
    'ca': 'Canada', 'cv': 'Cape Verde', 'cf': 'Central African Republic', 'td': 'Chad', 'cl': 'Chile',
    'cn': 'China', 'co': 'Colombia', 'km': 'Comoros', 'cg': 'Congo', 'cd': 'DR Congo',
    'cr': 'Costa Rica', 'ci': 'Ivory Coast', 'hr': 'Croatia', 'cu': 'Cuba', 'cy': 'Cyprus',
    'cz': 'Czech Republic', 'dk': 'Denmark', 'dj': 'Djibouti', 'dm': 'Dominica', 'do': 'Dominican Republic',
    'ec': 'Ecuador', 'eg': 'Egypt', 'sv': 'El Salvador', 'gq': 'Equatorial Guinea', 'er': 'Eritrea',
    'ee': 'Estonia', 'et': 'Ethiopia', 'fj': 'Fiji', 'fi': 'Finland', 'fr': 'France',
    'ga': 'Gabon', 'gm': 'Gambia', 'ge': 'Georgia', 'de': 'Germany', 'gh': 'Ghana',
    'gr': 'Greece', 'gd': 'Grenada', 'gt': 'Guatemala', 'gn': 'Guinea', 'gw': 'Guinea-Bissau',
    'gy': 'Guyana', 'ht': 'Haiti', 'hn': 'Honduras', 'hu': 'Hungary', 'is': 'Iceland',
    'in': 'India', 'id': 'Indonesia', 'ir': 'Iran', 'iq': 'Iraq', 'ie': 'Ireland',
    'il': 'Israel', 'it': 'Italy', 'jm': 'Jamaica', 'jp': 'Japan', 'jo': 'Jordan',
    'kz': 'Kazakhstan', 'ke': 'Kenya', 'ki': 'Kiribati', 'kp': 'North Korea', 'kr': 'South Korea',
    'kw': 'Kuwait', 'kg': 'Kyrgyzstan', 'la': 'Laos', 'lv': 'Latvia', 'lb': 'Lebanon',
    'ls': 'Lesotho', 'lr': 'Liberia', 'ly': 'Libya', 'li': 'Liechtenstein', 'lt': 'Lithuania',
    'lu': 'Luxembourg', 'mk': 'North Macedonia', 'mg': 'Madagascar', 'mw': 'Malawi', 'my': 'Malaysia',
    'mv': 'Maldives', 'ml': 'Mali', 'mt': 'Malta', 'mh': 'Marshall Islands', 'mr': 'Mauritania',
    'mu': 'Mauritius', 'mx': 'Mexico', 'fm': 'Micronesia', 'md': 'Moldova', 'mc': 'Monaco',
    'mn': 'Mongolia', 'me': 'Montenegro', 'ma': 'Morocco', 'mz': 'Mozambique', 'mm': 'Myanmar',
    'na': 'Namibia', 'nr': 'Nauru', 'np': 'Nepal', 'nl': 'Netherlands', 'nz': 'New Zealand',
    'ni': 'Nicaragua', 'ne': 'Niger', 'ng': 'Nigeria', 'no': 'Norway', 'om': 'Oman',
    'pk': 'Pakistan', 'pw': 'Palau', 'ps': 'Palestine', 'pa': 'Panama', 'pg': 'Papua New Guinea',
    'py': 'Paraguay', 'pe': 'Peru', 'ph': 'Philippines', 'pl': 'Poland', 'pt': 'Portugal',
    'qa': 'Qatar', 'ro': 'Romania', 'ru': 'Russia', 'rw': 'Rwanda', 'kn': 'Saint Kitts and Nevis',
    'lc': 'Saint Lucia', 'vc': 'Saint Vincent', 'ws': 'Samoa', 'sm': 'San Marino', 'st': 'Sao Tome and Principe',
    'sa': 'Saudi Arabia', 'sn': 'Senegal', 'rs': 'Serbia', 'sc': 'Seychelles', 'sl': 'Sierra Leone',
    'sg': 'Singapore', 'sk': 'Slovakia', 'si': 'Slovenia', 'sb': 'Solomon Islands', 'so': 'Somalia',
    'za': 'South Africa', 'ss': 'South Sudan', 'es': 'Spain', 'lk': 'Sri Lanka', 'sd': 'Sudan',
    'sr': 'Suriname', 'sz': 'Eswatini', 'se': 'Sweden', 'ch': 'Switzerland', 'sy': 'Syria',
    'tw': 'Taiwan', 'tj': 'Tajikistan', 'tz': 'Tanzania', 'th': 'Thailand', 'tl': 'Timor-Leste',
    'tg': 'Togo', 'to': 'Tonga', 'tt': 'Trinidad and Tobago', 'tn': 'Tunisia', 'tr': 'Turkey',
    'tm': 'Turkmenistan', 'tv': 'Tuvalu', 'ug': 'Uganda', 'ua': 'Ukraine', 'ae': 'UAE',
    'gb': 'United Kingdom', 'us': 'United States', 'uy': 'Uruguay', 'uz': 'Uzbekistan', 'vu': 'Vanuatu',
    'va': 'Vatican City', 've': 'Venezuela', 'vn': 'Vietnam', 'ye': 'Yemen', 'zm': 'Zambia',
    'zw': 'Zimbabwe', 'gl': 'Greenland', 'eh': 'Western Sahara', 'nc': 'New Caledonia', 'pf': 'French Polynesia'
  }), []);

  // Styling function for the map - white base with color on interaction
  const getStyle = useCallback(({ countryValue, countryCode, countryName, minValue, maxValue, color }) => {
    // Clicked state is handled by useEffect, so skip styling for clicked country here
    if (countryCode === clickedCountry) {
      return {
        fill: "#ef4444",
        fillOpacity: 1,
        stroke: "#dc2626",
        strokeWidth: 2.5,
        strokeOpacity: 1,
        cursor: "pointer",
        transition: "all 0.3s ease"
      };
    }
    
    // Hover state - blue fill
    if (countryCode === hoveredCountry) {
      return {
        fill: "#60a5fa",
        fillOpacity: 1,
        stroke: "#3b82f6",
        strokeWidth: 1.5,
        strokeOpacity: 1,
        cursor: "pointer",
        transition: "all 0.3s ease"
      };
    }
    
    // Default: white fill with black borders
    return {
      fill: "#ffffff",
      fillOpacity: 1,
      stroke: "#000000",
      strokeWidth: 0.5,
      strokeOpacity: 1,
      cursor: "pointer",
      transition: "all 0.3s ease"
    };
  }, [countryLookup, clickedCountry, hoveredCountry]);

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
                <div className="bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-gray-800/95 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl">
                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">
                      Our Global Network
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-blue-500 mx-auto mb-4 rounded-full"></div>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
                      We have established a strong presence across major
                      pharmaceutical markets worldwide, serving healthcare
                      providers with quality products and reliable services.
                    </p>
                    <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 mt-3 font-semibold">
                      Hover or click on any country to see details • We serve all countries worldwide
                    </p>
                  </div>
                </div>
              </div>

              {/* Map container with beautiful styling */}
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
                {/* Hover tooltip - shows for all countries */}
                <AnimatePresence>
                  {hoveredCountry && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
                    >
                      <div className="px-6 py-3 rounded-xl shadow-2xl border-2 bg-white dark:bg-gray-800 border-blue-500 dark:border-blue-400">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {countryLookup[hoveredCountry]?.name || countryNames[hoveredCountry] || hoveredCountry.toUpperCase()}
                          </div>
                          {countryLookup[hoveredCountry] && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {countryLookup[hoveredCountry].region}
                            </div>
                          )}
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                            ✓ We serve this region
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="world-map-svg" 
                     onMouseMove={(e) => {
                       const target = e.target;
                       if (target.tagName === 'path' && target.getAttribute('data-name')) {
                         const countryCode = target.getAttribute('data-id');
                         if (countryCode && countryCode !== hoveredCountry) {
                           setHoveredCountry(countryCode.toLowerCase());
                         }
                       }
                     }}
                     onMouseLeave={() => setHoveredCountry(null)}
                >
                  <WorldMap
                    key={clickedCountry || 'default'}
                    color="#ffffff"
                    title=""
                    value-suffix="countries"
                    size="xxl"
                    data={mapData}
                    richInteraction={true}
                    tooltipBgColor="transparent"
                    tooltipTextColor="transparent"
                    frame={false}
                    frameColor="transparent"
                    styleFunction={getStyle}
                    onClickFunction={(countryData) => {
                      if (countryData && countryData.countryCode) {
                        const code = countryData.countryCode.toLowerCase();
                        setClickedCountry(clickedCountry === code ? null : code);
                        setHoveredCountry(null);
                      }
                    }}
                  />
                </div>
                
                {/* Clicked country info - shows for all countries */}
                <AnimatePresence>
                  {clickedCountry && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-4 right-4 rounded-xl p-4 shadow-2xl border-2 max-w-xs z-10 bg-white dark:bg-gray-800 border-blue-500 dark:border-blue-400"
                    >
                      <button
                        onClick={() => setClickedCountry(null)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                      <div className="pr-6">
                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {countryLookup[clickedCountry]?.name || countryNames[clickedCountry] || clickedCountry.toUpperCase()}
                        </div>
                        {countryLookup[clickedCountry] && (
                          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                            {countryLookup[clickedCountry].region}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-green-600 dark:text-green-400 font-semibold text-sm">✓ Service Available</div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          We provide pharmaceutical products and services globally with quality assurance and reliable delivery to this region.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regional Presence - Load in stage 3+ */}
      {loadStage >= 3 && (
        <section className="section-padding bg-white dark:bg-gray-900">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Regional Presence
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Explore our presence across different regions and the countries we serve.
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
                <RegionCard
                  key={region.name}
                  region={region}
                  variants={itemVariants}
                />
              ))}
            </motion.div>
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
