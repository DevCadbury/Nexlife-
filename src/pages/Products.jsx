import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
      { threshold: 0.1, ...options }
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const sectionElement = document.getElementById(`section-${categoryId}`);
    if (sectionElement) {
      const headerHeight = 128;
      const elementPosition = sectionElement.offsetTop - headerHeight;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
    }
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (value.trim()) {
        setIsSearching(true);
        if (selectedCategory !== "all") {
          setSelectedCategory("all");
        }
      } else {
        setIsSearching(false);
      }
    },
    [selectedCategory]
  );

  // Clear search
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── Route helper ─── */
  const getSubcategoryRoute = (categoryId, subcategory) => {
    if (categoryId === "capsules" && subcategory === "Analgesic") return "/products/capsules/analgesic";
    if (categoryId === "capsules" && subcategory === "Anti-Convulsant") return "/products/capsules/anti-convulsant";
    if (subcategory === "Analgesic") return "/products/analgesic";
    if (subcategory === "Anthelmintic") return "/products/anthelmintic";
    if (subcategory === "Anti Allergic") return "/products/anti-allergic";
    if (subcategory === "Anti Diabetic") return "/products/anti-diabetic";
    if (categoryId === "capsules" && subcategory === "Anti-Malarial") return "/products/capsules/anti-malarial";
    if (subcategory === "Anti Malarial") return "/products/anti-malarial";
    if (categoryId === "capsules" && (subcategory === "Anti Protozoal" || subcategory === "Anti-Protozoal")) return "/products/capsules/anti-protozoal";
    if (subcategory === "Anti-Protozoal" || subcategory === "Anti Protozoal") return "/products/anti-protozoal";
    if (subcategory === "Anti Spasmodic") return "/products/anti-spasmodic";
    if (subcategory === "Anti biotics General") return "/products/antibiotics-general";
    if (subcategory === "Anti-Convulsant") return "/products/anti-convulsant";
    if (subcategory === "Anti-Emetic") return "/products/anti-emetic";
    if (categoryId === "capsules" && subcategory === "Anti-Fungal") return "/products/capsules/anti-fungal";
    if (subcategory === "Anti-Fungal") return "/products/anti-fungal";
    if (categoryId === "capsules" && subcategory === "Anti-Ulserative") return "/products/capsules/anti-ulcerative";
    if (subcategory === "Anti-Ulserative") return "/products/anti-ulcerative";
    if (subcategory === "Anti-Viral") return "/products/anti-viral";
    if (categoryId === "capsules" && subcategory === "Cardiovascular") return "/products/capsules/cardiovascular";
    if (subcategory === "Cardiovascular") return "/products/cardiovascular";
    if (subcategory === "Erectile Dysfunction") return "/products/erectile-dysfunction";
    if (subcategory === "Lipid Lowering") return "/products/lipid-lowering";
    if (subcategory === "Platelet Aggregation") return "/products/platelet-aggregation";
    if (subcategory === "Steroidal Drugs") return "/products/steroidal-drugs";
    if (categoryId === "capsules" && subcategory === "Anti-Depressant") return "/products/capsules/anti-depressant";
    if (categoryId === "capsules" && subcategory === "Anti-Epileptic") return "/products/capsules/anti-epileptic";
    if (categoryId === "capsules" && subcategory === "Anti-Migraine") return "/products/capsules/anti-migraine";
    if (categoryId === "capsules" && subcategory === "Anti-Tubercular") return "/products/capsules/anti-tubercular";
    if (categoryId === "capsules" && subcategory === "General Antibiotics") return "/products/capsules/general-antibiotics";
    if (subcategory === "General Antibiotics") return "/products/general-antibiotics-capsules";
    if (categoryId === "capsules" && subcategory === "Multi Vitamins") return "/products/capsules/multi-vitamins";
    if (subcategory === "Multi Vitamins") return "/products/multi-vitamins-capsules";
    if (categoryId === "capsules" && subcategory === "Anti-Ulcerative") return "/products/capsules/anti-ulcerative";
    return "/products";
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative py-14 sm:py-18 lg:py-24">
        <div className="absolute inset-0 z-0">
          <img
            src="/our-product-bg.png"
            alt="Products Background"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Our Products
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                Discover our comprehensive range of pharmaceutical products,
                from tablets and capsules to surgical supplies and ayurvedic
                formulations.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Category Filter + Search ── */}
      <section className="py-10 sm:py-12 lg:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Pills */}
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToSection(category.id)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-md`
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <category.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Gallery Link + Search */}
          <FadeIn delay={50}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto mb-10 sm:mb-14">
              <button
                onClick={() =>
                  window.open(
                    "https://www.nexlifeinternational.com/product-gallery",
                    "_blank"
                  )
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Product Gallery
              </button>

              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </FadeIn>

          {/* ── Products Display ── */}
          {hasSearchResults ? (
            <div className="space-y-12 sm:space-y-16">
              {Object.entries(searchResults).map(
                ([categoryId, categoryData]) => {
                  const hasContent =
                    (categoryData.subcategories &&
                      categoryData.subcategories.length > 0) ||
                    (categoryData.products &&
                      categoryData.products.length > 0) ||
                    (categoryData.categories &&
                      categoryData.categories.length > 0);

                  if (!hasContent) return null;

                  return (
                    <FadeIn key={categoryId}>
                      <div
                        id={`section-${categoryId}`}
                        ref={(el) => (sectionRefs.current[categoryId] = el)}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                      >
                        {/* Category Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 sm:px-8 py-5 sm:py-7 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 capitalize">
                                {categories.find((c) => c.id === categoryId)?.name}
                              </h2>
                              <p className="text-blue-100 text-sm sm:text-base max-w-3xl">
                                {categoryData.description}
                              </p>
                            </div>
                            <div className="hidden sm:flex ml-4 w-14 h-14 lg:w-16 lg:h-16 bg-white/15 rounded-xl items-center justify-center flex-shrink-0 overflow-hidden p-2.5">
                              <img
                                src={getCategoryHeaderImage(categoryId)}
                                alt={categories.find((c) => c.id === categoryId)?.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Category Content */}
                        <div className="p-4 sm:p-6 lg:p-8">
                          {categoryId === "tablets" || categoryId === "capsules" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                              {categoryData.subcategories.map((subcategory, index) => {
                                const productImage = getProductImage(categoryId, subcategory);
                                return (
                                  <Link
                                    key={index}
                                    to={getSubcategoryRoute(categoryId, subcategory)}
                                    className="group flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                  >
                                    {productImage ? (
                                      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                        <img
                                          src={productImage}
                                          alt={subcategory}
                                          className="w-full h-full object-contain"
                                          loading="lazy"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                        <Pill className="w-5 h-5 text-white" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                                        {subcategory}
                                      </h3>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                                  </Link>
                                );
                              })}
                            </div>
                          ) : categoryId === "dry-syrups" || categoryId === "ayurvedic" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                              {categoryData.subcategories.map((subcategory, index) => {
                                const productImage = getProductImage(categoryId, subcategory);
                                return (
                                  <Link
                                    key={index}
                                    to={
                                      categoryId === "dry-syrups"
                                        ? "/products/dry-syrups"
                                        : "/products/ayurvedic"
                                    }
                                    className="group flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                  >
                                    {productImage ? (
                                      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                        <img
                                          src={productImage}
                                          alt={subcategory}
                                          className="w-full h-full object-contain"
                                          loading="lazy"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                        <Pill className="w-5 h-5 text-white" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                        {subcategory}
                                      </h3>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                                  </Link>
                                );
                              })}
                            </div>
                          ) : categoryId === "surgical" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                              {categoryData.categories.map((surgicalCategory, index) => {
                                const surgicalImage = getSurgicalImage(surgicalCategory);
                                return (
                                  <Link
                                    key={index}
                                    to="/products/surgical"
                                    className="group bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                                  >
                                    <div className="w-full h-28 sm:h-32 overflow-hidden">
                                      <img
                                        src={surgicalImage}
                                        alt={surgicalCategory}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="p-3 sm:p-4 text-center">
                                      <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200 mb-2">
                                        {surgicalCategory}
                                      </h3>
                                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 group-hover:translate-x-0.5 transition-transform duration-200">
                                        View Products
                                        <ArrowRight className="w-3 h-3" />
                                      </span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </FadeIn>
                  );
                }
              )}
            </div>
          ) : (
            <FadeIn>
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                  Try adjusting your search terms or browse all categories.
                </p>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── Download Catalogue CTA ── */}
      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Download Complete Product Catalogue
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Get detailed information about all our products, specifications,
              and pricing in our comprehensive catalogue.
            </p>
            <a
              href="https://drive.google.com/file/d/1Ct4xhTjZbbe-XoAjZZor7N74_YwWZPYC/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200 shadow-lg text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Download PDF Catalogue
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-5 right-5 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ${
          showScrollToTop
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Products;
