import React, { useState, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import product1 from "../assets/images/products/1.png";
import product2 from "../assets/images/products/2.png";
import product3 from "../assets/images/products/3.png";
import product4 from "../assets/images/products/4.png";
import product5 from "../assets/images/products/5.png";
import product6 from "../assets/images/products/6.png";
import product7 from "../assets/images/products/7.png";
import product8 from "../assets/images/products/8.png";
import product9 from "../assets/images/products/9.png";

// Surgical product images
import adhesiveTapesImg from "../assets/images/Surgical/Adhesive Tapes & Plasters .png";
import bandagesImg from "../assets/images/Surgical/Bandages & Dressings.png";
import surgicalInstrumentsImg from "../assets/images/Surgical/Surgical Instruments.png";
import infusionSetsImg from "../assets/images/Surgical/Infusion Sets.png";
import cathetersImg from "../assets/images/Surgical/Catheters & Tubes.png";
import ppeImg from "../assets/images/Surgical/Personal Protective Equipment.png";
import diagnosticKitsImg from "../assets/images/Surgical/Diagnostic Kits.png";
import patientCareImg from "../assets/images/Surgical/Patient Care Products.png";
import {
  Pill,
  Syringe,
  Heart,
  Brain,
  Shield,
  Eye,
  Leaf,
  Scissors,
  ArrowRight,
  Search,
  Filter,
  Download,
  ArrowUp,
  Microscope,
  Stethoscope,
  Activity,
  Zap,
  Droplets,
  Flame,
  Sparkles,
  Target,
  Clock,
  AlertTriangle,
  Thermometer,
  Gauge,
  Battery,
  Cpu,
  Wrench,
  TestTube,
  Beaker,
} from "lucide-react";

const Products = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Refs for smooth scrolling to sections
  const sectionRefs = useRef({});
  const searchInputRef = useRef(null);

  const categories = [
    {
      id: "all",
      name: "All Products",
      icon: Pill,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "tablets",
      name: "Tablets",
      icon: Pill,
      color: "from-green-500 to-green-600",
    },
    {
      id: "capsules",
      name: "Capsules",
      icon: Microscope,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "dry-syrups",
      name: "Dry Syrups",
      icon: Droplets,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "ayurvedic",
      name: "Ayurvedic",
      icon: Leaf,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "surgical",
      name: "Surgical",
      icon: Stethoscope,
      color: "from-red-500 to-red-600",
    },
  ];

  // Product data organized by categories
  const productsData = {
    tablets: {
      description:
        "A tablet (also known as a pill) is a pharmaceutical oral dosage form (oral solid dosage, or OSD) or solid unit dosage form",
      subcategories: [
        "Analgesic",
        "Anthelmintic",
        "Anti Allergic",
        "Anti Diabetic",
        "Anti Malarial",
        "Anti Protozoal",
        "Anti Spasmodic",
        "Anti biotics General",
        "Anti-Convulsant",
        "Anti-Emetic",
        "Anti-Fungal",
        "Anti-Ulserative",
        "Anti-Viral",
        "Cardiovascular",
        "Erectile Dysfunction",
        "Lipid Lowering",
        "Platelet Aggregation",
        "Steroidal Drugs",
      ],
    },
    capsules: {
      description:
        "A 'capsule' can refer to several things, including a small container for medicine, a membranous structure in the body, a spacecraft, or a geometric shape",
      subcategories: [
        "Analgesic",
        "Anti-Convulsant",
        "Anti-Depressant",
        "Anti-Epileptic",
        "Anti-Fungal",
        "Anti-Malarial",
        "Anti-Migraine",
        "Anti-Protozoal",
        "Anti-Tubercular",
        "Anti-Ulcerative",
        "Cardiovascular",
        "General Antibiotics",
        "Multi Vitamins",
      ],
    },
    "dry-syrups": {
      description:
        "Professional dry syrup formulations for pediatric and adult use with precise dosing and excellent stability",
      subcategories: ["All Dry Syrups"],
      products: [
        {
          name: "Azithromycin Dry Syrup",
          generic: "Azithromycin dihydrate USP",
          strength: "100mg/5ml",
          packing: "HDPE Bottle",
          image: product1,
        },
        {
          name: "Azithromycin Dry Syrup",
          generic: "Azithromycin dihydrate USP",
          strength: "200mg/5ml",
          packing: "HDPE Bottle",
          image: product2,
        },
        {
          name: "Artemether and Lumefantrine",
          generic: "Artemether + Lumefantrine",
          strength: "20mg + 120mg/5ml",
          packing: "HDPE Bottle",
          image: product3,
        },
        {
          name: "Artemether and Lumefantrine",
          generic: "Artemether + Lumefantrine",
          strength: "40mg + 240mg/5ml",
          packing: "HDPE Bottle",
          image: product4,
        },
        {
          name: "Erythromycin Estolate",
          generic: "Erythromycin Estolate BP",
          strength: "125mg/5ml",
          packing: "HDPE Bottle",
          image: product5,
        },
      ],
    },
    ayurvedic: {
      description:
        "Traditional Ayurvedic formulations for natural healing and wellness",
      subcategories: ["All Ayurvedic"],
      products: [
        {
          name: "MEDIMOVE Pain Relief Gel",
          generic: "Ayurvedic Pain Relief Gel",
          packing: "30g",
          image: product6,
        },
        {
          name: "MEDIMOVE Pain Relief Balm",
          generic: "Ayurvedic Pain Relief Balm",
          packing: "10g, 25g",
          image: product7,
        },
        {
          name: "TOP ACTION Itch Care",
          generic: "Ayurvedic Itch Care Cream",
          packing: "25g",
          image: product8,
        },
        {
          name: "HAIR CARE Oil",
          generic: "Almond, Jasmine, Amla, Coconut Oil",
          packing: "100/200/500ml",
          image: product9,
        },
        {
          name: "TURMERIC CREAM",
          generic: "Turmeric Skin Cream",
          packing: "30g",
          image: product1,
        },
      ],
    },
    surgical: {
      description:
        "Comprehensive range of surgical and medical supplies for healthcare professionals",
      categories: [
        "Adhesive Tapes & Plasters",
        "Bandages & Dressings",
        "Surgical Instruments",
        "Infusion Sets",
        "Catheters & Tubes",
        "Personal Protective Equipment",
        "Diagnostic Kits",
        "Patient Care Products",
      ],
    },
  };

  // Optimized motion variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.03,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    return selectedCategory === "all"
      ? Object.keys(productsData)
      : [selectedCategory];
  }, [selectedCategory]);

  // Memoized search results to prevent unnecessary re-renders
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return productsData;

    const searchLower = searchTerm.toLowerCase();
    const results = {};

    Object.entries(productsData).forEach(([categoryId, categoryData]) => {
      const filteredData = { ...categoryData };

      if (categoryData.subcategories) {
        filteredData.subcategories = categoryData.subcategories.filter((sub) =>
          sub.toLowerCase().includes(searchLower)
        );
      }
      if (categoryData.products) {
        filteredData.products = categoryData.products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.generic.toLowerCase().includes(searchLower)
        );
      }
      if (categoryData.categories) {
        filteredData.categories = categoryData.categories.filter((cat) =>
          cat.toLowerCase().includes(searchLower)
        );
      }

      // Only include categories that have content after filtering
      const hasContent =
        (filteredData.subcategories && filteredData.subcategories.length > 0) ||
        (filteredData.products && filteredData.products.length > 0) ||
        (filteredData.categories && filteredData.categories.length > 0);

      if (hasContent) {
        results[categoryId] = filteredData;
      }
    });

    return results;
  }, [searchTerm]);

  // Product images mapping
  const getProductImage = (categoryId, subcategory) => {
    const imageMap = {
      tablets: {
        "Analgesic": "/PRODUCTS/T - ANALGESIC.png",
        "Anthelmintic": "/PRODUCTS/T - Anthelmintic.png",
        "Anti Allergic": "/PRODUCTS/T - allergic.png",
        "Anti Diabetic": "/PRODUCTS/T - Anti DIABETICS.png",
        "Anti Malarial": "/PRODUCTS/T - ANTI MALARIA.png",
        "Anti Protozoal": "/PRODUCTS/T - ANTIPROTOZOLE.png",
        "Anti Spasmodic": "/PRODUCTS/T - Spasmodic.png",
        "Anti biotics General": "/PRODUCTS/T - antibiotic.png",
        "Anti-Convulsant": "/PRODUCTS/T - Convulsant.png",
        "Anti-Emetic": "/PRODUCTS/T - Emetic.png",
        "Anti-Fungal": "/PRODUCTS/T - ANTI FUNGAL.png",
        "Anti-Ulserative": "/PRODUCTS/T - Ulserative.png",
        "Anti-Viral": "/PRODUCTS/T - Viral.png",
        "Cardiovascular": "/PRODUCTS/T - Cardiovascular.png",
        "Erectile Dysfunction": "/PRODUCTS/T - erectile-dysfunction.png",
        "Lipid Lowering": "/PRODUCTS/T - Lipid Lowering.png",
        "Platelet Aggregation": "/PRODUCTS/T - Platelet Aggregation.png",
        "Steroidal Drugs": "/PRODUCTS/T - Steroidal Drugs.png",
      },
      capsules: {
        "Analgesic": "/PRODUCTS/C - ANALGESIC.png",
        "Anti-Convulsant": "/PRODUCTS/C - Anti-Convulsant.png",
        "Anti-Depressant": "/PRODUCTS/C - Anti-Depressant.png",
        "Anti-Epileptic": "/PRODUCTS/C - Epileptic.png",
        "Anti-Fungal": "/PRODUCTS/C - Anti-Fungal.png",
        "Anti-Malarial": "/PRODUCTS/C -Anti-Malarial.png",
        "Anti-Migraine": "/PRODUCTS/C - migraine.png",
        "Anti-Protozoal": "/PRODUCTS/C-Protozoal.png",
        "Anti-Tubercular": "/PRODUCTS/C - Tubercular.png",
        "Anti-Ulcerative": "/PRODUCTS/C - Ulcerative.png",
        "Cardiovascular": "/PRODUCTS/C - Cardiovascular.png",
        "General Antibiotics": "/PRODUCTS/C -  antibiotic.png",
        "Multi Vitamins": "/PRODUCTS/C - MULTIVITAMINS.png",
      },
      "dry-syrups": {
        "All Dry Syrups": "/PRODUCTS/all syrups.png",
      },
      ayurvedic: {
        "All Ayurvedic": "/PRODUCTS/AYURVEDA.png",
      }
    };
    
    return imageMap[categoryId]?.[subcategory] || null;
  };

  // Category header images mapping
  const getCategoryHeaderImage = (categoryId) => {
    const headerImages = {
      "all": "/PRODUCTS/medicine.png",
      "tablets": "/PRODUCTS/drug.png",
      "capsules": "/PRODUCTS/capsule.png",
      "dry-syrups": "/PRODUCTS/syrup.png",
      "ayurvedic": "/PRODUCTS/drug (1).png",
      "surgical": "/PRODUCTS/medicine.png",
    };
    return headerImages[categoryId] || "/PRODUCTS/medicine.png";
  };

  // Surgical category images
  const getSurgicalImage = (category) => {
    const surgicalImages = {
      "Adhesive Tapes & Plasters": adhesiveTapesImg,
      "Bandages & Dressings": bandagesImg,
      "Surgical Instruments": surgicalInstrumentsImg,
      "Infusion Sets": infusionSetsImg,
      "Catheters & Tubes": cathetersImg,
      "Personal Protective Equipment": ppeImg,
      "Diagnostic Kits": diagnosticKitsImg,
      "Patient Care Products": patientCareImg,
    };
    return surgicalImages[category] || surgicalInstrumentsImg;
  };

  // Optimized smooth scroll function with proper offset
  const scrollToSection = useCallback((categoryId) => {
    setSelectedCategory(categoryId);

    if (categoryId === "all") {
      // Scroll to top with offset for fixed header
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    // Find the section element and scroll to it with offset
    const sectionElement = document.getElementById(`section-${categoryId}`);
    if (sectionElement) {
      const headerHeight = 128; // Adjust based on your header height
      const elementPosition = sectionElement.offsetTop - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  }, []);

  // Handle search input changes with debouncing
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value.trim()) {
        setIsSearching(true);
        // Auto-select "all" category when searching
        if (selectedCategory !== "all") {
          setSelectedCategory("all");
        }
      } else {
        setIsSearching(false);
      }
    },
    [selectedCategory]
  );

  // Clear search and reset to selected category
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setIsSearching(false);
    searchInputRef.current?.focus();
  }, []);

  // Check if search has results
  const hasSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return true;
    return Object.keys(searchResults).length > 0;
  }, [searchTerm, searchResults]);

  // Scroll to top functionality
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Show scroll to top button when scrolled down
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Add scroll event listener
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300); // Show after 300px scroll
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/our-product-bg.png"
            alt="Products Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Text UI Pane */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Our Products
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Discover our comprehensive range of pharmaceutical products,
                from tablets and capsules to surgical supplies and ayurvedic
                formulations.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-10 lg:mb-12"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <category.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.split(" ")[0]}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Product Gallery Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="flex justify-center mb-6"
          >
            <button
              onClick={() => window.open('https://www.nexlifeinternational.com/product-gallery', '_blank')}
              className="group cursor-pointer flex items-center justify-center gap-2.5 text-sm bg-gradient-to-b from-[#3470fa] to-[#313ed7] text-white border-2 border-[#0618db] h-[50px] px-5 rounded-[5px] font-semibold transform scale-90 relative hover:from-[#313ed7] hover:to-[#3470fa] active:from-[#313ed7] active:to-[#3470fa]"
            >
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-5 h-5 border-2 border-transparent group-hover:border-[rgba(255,0,170,0.692)] transition-all duration-200" />
              </div>
              <span className="title">Product Gallery</span>
            </button>
          </motion.div>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="max-w-sm sm:max-w-md mx-auto mb-8 sm:mb-10 lg:mb-12"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200 text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 text-lg sm:text-xl"
                >
                  ×
                </button>
              )}
            </div>
          </motion.div>

          {/* Products Display */}
          <AnimatePresence mode="wait">
            {hasSearchResults ? (
              <motion.div
                key={`products-${searchTerm}-${selectedCategory}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-16"
              >
                {Object.entries(searchResults).map(
                  ([categoryId, categoryData]) => {
                    // Check if there's content to display
                    const hasContent =
                      (categoryData.subcategories &&
                        categoryData.subcategories.length > 0) ||
                      (categoryData.products &&
                        categoryData.products.length > 0) ||
                      (categoryData.categories &&
                        categoryData.categories.length > 0);

                    if (!hasContent) return null;

                    return (
                      <motion.div
                        key={categoryId}
                        id={`section-${categoryId}`}
                        ref={(el) => (sectionRefs.current[categoryId] = el)}
                        variants={itemVariants}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-800 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 overflow-hidden transition-all duration-300 hover:shadow-2xl"
                      >
                        {/* Category Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
                          {/* Elegant border pattern */}
                          <div className="absolute inset-0 border-2 border-white/20 rounded-t-xl sm:rounded-t-2xl"></div>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex-1">
                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 capitalize">
                                {
                                  categories.find((c) => c.id === categoryId)
                                    ?.name
                                }
                              </h2>
                              <p className="text-blue-100 text-sm sm:text-base lg:text-lg max-w-3xl">
                                {categoryData.description}
                              </p>
                            </div>
                            <div className="hidden sm:block ml-4">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-sm overflow-hidden p-2 sm:p-3">
                                <img 
                                  src={getCategoryHeaderImage(categoryId)} 
                                  alt={categories.find((c) => c.id === categoryId)?.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Category Content */}
                        <div className="p-4 sm:p-6 lg:p-8">
                          {categoryId === "tablets" ||
                          categoryId === "capsules" ? (
                            // Subcategories Grid with Icons
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                              {categoryData.subcategories.map(
                                (subcategory, index) => {
                                  const productImage = getProductImage(categoryId, subcategory);
                                  return (
                                    <motion.div
                                      key={index}
                                      variants={cardVariants}
                                      whileHover="hover"
                                      className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-gray-800 dark:border-gray-500 hover:border-blue-600 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                                    >
                                      {/* Processing Bar Effect */}
                                      <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                                          initial={{ width: "0%" }}
                                          whileHover={{
                                            width: "100%",
                                            transition: {
                                              duration: 1.5,
                                              ease: "easeInOut",
                                            },
                                          }}
                                        />
                                      </div>

                                      {/* Processing Indicator */}
                                      <div className="absolute top-0 left-0 w-full h-2 bg-transparent overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-blue-400 via-white to-blue-400 opacity-80"
                                          initial={{ width: "0%", x: "0%" }}
                                          whileHover={{
                                            width: "100%",
                                            x: "0%",
                                            transition: {
                                              duration: 1.5,
                                              ease: "easeInOut",
                                            },
                                          }}
                                        />
                                      </div>

                                      {/* Elegant corner accent */}
                                      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                      <div className="flex items-center space-x-3 mb-4">
                                        {productImage ? (
                                          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <img 
                                              src={productImage} 
                                              alt={subcategory}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <Pill className="w-6 h-6 text-white" />
                                          </div>
                                        )}
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                          {subcategory}
                                        </h3>
                                      </div>
                                      <Link
                                        to={
                                          categoryId === "capsules" &&
                                          subcategory === "Analgesic"
                                            ? "/products/capsules/analgesic"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Convulsant"
                                            ? "/products/capsules/anti-convulsant"
                                            : subcategory === "Analgesic"
                                            ? "/products/analgesic"
                                            : subcategory === "Anthelmintic"
                                            ? "/products/anthelmintic"
                                            : subcategory === "Anti Allergic"
                                            ? "/products/anti-allergic"
                                            : subcategory === "Anti Diabetic"
                                            ? "/products/anti-diabetic"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Malarial"
                                            ? "/products/capsules/anti-malarial"
                                            : subcategory === "Anti Malarial"
                                            ? "/products/anti-malarial"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti Protozoal"
                                            ? "/products/capsules/anti-protozoal"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Protozoal"
                                            ? "/products/capsules/anti-protozoal"
                                            : subcategory === "Anti-Protozoal"
                                            ? "/products/anti-protozoal"
                                            : subcategory === "Anti Protozoal"
                                            ? "/products/anti-protozoal"
                                            : subcategory === "Anti Spasmodic"
                                            ? "/products/anti-spasmodic"
                                            : subcategory ===
                                              "Anti biotics General"
                                            ? "/products/antibiotics-general"
                                            : subcategory === "Anti-Convulsant"
                                            ? "/products/anti-convulsant"
                                            : subcategory === "Anti-Emetic"
                                            ? "/products/anti-emetic"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Fungal"
                                            ? "/products/capsules/anti-fungal"
                                            : subcategory === "Anti-Fungal"
                                            ? "/products/anti-fungal"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Ulserative"
                                            ? "/products/capsules/anti-ulcerative"
                                            : subcategory === "Anti-Ulserative"
                                            ? "/products/anti-ulcerative"
                                            : subcategory === "Anti-Viral"
                                            ? "/products/anti-viral"
                                            : categoryId === "capsules" &&
                                              subcategory === "Cardiovascular"
                                            ? "/products/capsules/cardiovascular"
                                            : subcategory === "Cardiovascular"
                                            ? "/products/cardiovascular"
                                            : subcategory ===
                                              "Erectile Dysfunction"
                                            ? "/products/erectile-dysfunction"
                                            : subcategory === "Lipid Lowering"
                                            ? "/products/lipid-lowering"
                                            : subcategory ===
                                              "Platelet Aggregation"
                                            ? "/products/platelet-aggregation"
                                            : subcategory === "Steroidal Drugs"
                                            ? "/products/steroidal-drugs"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Depressant"
                                            ? "/products/capsules/anti-depressant"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Epileptic"
                                            ? "/products/capsules/anti-epileptic"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Migraine"
                                            ? "/products/capsules/anti-migraine"
                                            : categoryId === "capsules" &&
                                              subcategory === "Anti-Tubercular"
                                            ? "/products/capsules/anti-tubercular"
                                            : categoryId === "capsules" &&
                                              subcategory ===
                                                "General Antibiotics"
                                            ? "/products/capsules/general-antibiotics"
                                            : subcategory ===
                                              "General Antibiotics"
                                            ? "/products/general-antibiotics-capsules"
                                            : categoryId === "capsules" &&
                                              subcategory === "Multi Vitamins"
                                            ? "/products/capsules/multi-vitamins"
                                            : subcategory === "Multi Vitamins"
                                            ? "/products/multi-vitamins-capsules"
                                            : "/products"
                                        }
                                        className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-300 group-hover:translate-x-1"
                                      >
                                        <span>Check More</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                      </Link>
                                    </motion.div>
                                  );
                                }
                              )}
                            </div>
                          ) : categoryId === "dry-syrups" ||
                            categoryId === "ayurvedic" ? (
                            // Subcategories grid to match Tablets/Capsules UX
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {categoryData.subcategories.map(
                                (subcategory, index) => {
                                  const productImage = getProductImage(categoryId, subcategory);
                                  return (
                                    <motion.div
                                      key={index}
                                      variants={cardVariants}
                                      whileHover="hover"
                                      className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-gray-800 dark:border-gray-500 hover:border-blue-600 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                                    >
                                      {/* Processing Bar Effect */}
                                      <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                                          initial={{ width: "0%" }}
                                          whileHover={{
                                            width: "100%",
                                            transition: {
                                              duration: 1.5,
                                              ease: "easeInOut",
                                            },
                                          }}
                                        />
                                      </div>

                                      {/* Processing Indicator */}
                                      <div className="absolute top-0 left-0 w-full h-2 bg-transparent overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-blue-400 via-white to-blue-400 opacity-80"
                                          initial={{ width: "0%", x: "0%" }}
                                          whileHover={{
                                            width: "100%",
                                            x: "0%",
                                            transition: {
                                              duration: 1.5,
                                              ease: "easeInOut",
                                            },
                                          }}
                                        />
                                      </div>

                                      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                      <div className="flex items-center space-x-3 mb-4">
                                        {productImage ? (
                                          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <img 
                                              src={productImage} 
                                              alt={subcategory}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <Pill className="w-6 h-6 text-white" />
                                          </div>
                                        )}
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                          {subcategory}
                                        </h3>
                                      </div>
                                      <Link
                                        to={
                                          categoryId === "dry-syrups"
                                            ? "/products/dry-syrups"
                                            : "/products/ayurvedic"
                                        }
                                        className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-300 group-hover:translate-x-1"
                                      >
                                        <span>Check More</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                      </Link>
                                    </motion.div>
                                  );
                                }
                              )}
                            </div>
                          ) : categoryId === "surgical" ? (
                            // Surgical Categories with Product Images
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                              {categoryData.categories.map(
                                (surgicalCategory, index) => {
                                  const surgicalImage =
                                    getSurgicalImage(surgicalCategory);
                                  return (
                                    <motion.div
                                      key={index}
                                      variants={cardVariants}
                                      whileHover="hover"
                                      className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-gray-800 dark:border-gray-500 hover:border-red-600 dark:hover:border-red-400 hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden"
                                    >
                                      {/* Progress Bar Effect */}
                                      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-600 overflow-hidden rounded-t-xl">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-t-xl"
                                          initial={{ width: "0%" }}
                                          whileHover={{
                                            width: "100%",
                                            transition: {
                                              duration: 0.8,
                                              ease: "easeInOut",
                                            },
                                          }}
                                        />
                                      </div>

                                      {/* Processing Indicator */}
                                      <div className="absolute top-0 left-0 w-full h-2 bg-transparent overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-red-400 via-white to-red-400 opacity-80"
                                          initial={{ width: "0%", x: "0%" }}
                                          whileHover={{
                                            width: "100%",
                                            x: "0%",
                                            transition: {
                                              duration: 1.5,
                                              ease: "easeInOut",
                                            },
                                          }}
                                        />
                                      </div>

                                      {/* Elegant corner accent */}
                                      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                      {/* Product Image */}
                                      <div className="w-full h-24 sm:h-32 mb-3 sm:mb-4 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 group-hover:border-red-300 dark:group-hover:border-red-500 transition-colors duration-300">
                                        <img
                                          src={surgicalImage}
                                          alt={surgicalCategory}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          loading="lazy"
                                        />
                                      </div>

                                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                                        {surgicalCategory}
                                      </h3>
                                      <Link
                                        to="/products/surgical"
                                        className="inline-flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-all duration-300 group-hover:translate-x-1"
                                      >
                                        <span>View Products</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                      </Link>
                                    </motion.div>
                                  );
                                }
                              )}
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </motion.div>
            ) : (
              // No Results Message
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Try adjusting your search terms or browse all categories.
                </p>
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  <span>Clear Search</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Download Catalogue CTA */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Download Complete Product Catalogue
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Get detailed information about all our products, specifications,
              and pricing in our comprehensive catalogue.
            </p>
            <motion.a
              href="https://drive.google.com/file/d/1Ct4xhTjZbbe-XoAjZZor7N74_YwWZPYC/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center space-x-2 sm:space-x-3 bg-white text-blue-600 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span>Download PDF Catalogue</span>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 lg:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white/20 hover:border-white/40"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
