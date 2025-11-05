import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, useInView, animate, useMotionValue } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Globe,
  Users,
  Award,
  Download,
  Heart,
  Clock,
  DollarSign,
  UserCheck,
  Pill,
  Users2,
  MapPin,
  Building2,
  Factory,
  Truck,
  Warehouse,
  Microscope,
  TestTube,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Mail,
  X,
} from "lucide-react";
import DownloadButton from "../components/DownloadButton";
import { GlowingEffect } from "../components/ui/glowing-effect";
import DebugInfo from "../components/DebugInfo";
import heroImage from "../assets/images/3721740.jpg";
import heroImage2 from "../assets/images/3699248.jpg";
import heroImage3 from "../assets/images/6226335.jpg";
import logoImage from "../assets/images/02.png";
import product1 from "../assets/images/products/1.png";
import product2 from "../assets/images/products/2.png";
import product3 from "../assets/images/products/3.png";
import product4 from "../assets/images/products/4.png";
import product5 from "../assets/images/products/5.png";
import product6 from "../assets/images/products/6.png";
import office1 from "../assets/images/office/Office_1.jpg";
import office2 from "../assets/images/office/Office_2.jpg";
import office3 from "../assets/images/office/Office_3.jpg";
import office4 from "../assets/images/office/Office_4.jpg";
import office5 from "../assets/images/office/Office_5.jpg";
import office6 from "../assets/images/office/Office_6.jpg";
import certificationImage from "../assets/images/image.png";
import CountUp from "react-countup";

const Home = () => {
  const { t } = useTranslation();

  const whyChooseUs = [
    {
      icon: Heart,
      title: "Client Satisfaction",
      description:
        "Your satisfaction is our top priority. We aim to exceed your expectations with every interaction and delivery.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Clock,
      title: "Supply Chain Reliability",
      description:
        "Timeliness is critical in the pharmaceutical industry. We ensure reliable and consistent supply chain management.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: DollarSign,
      title: "Competitive Pricing",
      description:
        "We offer competitive and affordable pricing without compromising on quality or service standards.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const companyPillars = [
    {
      icon: UserCheck,
      title: "EMPLOYEE'S",
      description: "Our dedicated team of professionals",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Pill,
      title: "MEDICINE",
      description: "Quality pharmaceutical products",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Users2,
      title: "CUSTOMERS",
      description: "Customer satisfaction first",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: MapPin,
      title: "COUNTRIES",
      description: "Global presence worldwide",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const companyInfo = [
    {
      title: "Our Mission",
      description:
        "At Nexlife International, our mission is clear: we aim to improve lives by providing affordable, high-quality pharmaceutical solutions to healthcare providers worldwide. We are committed to bridging the gap between pharmaceutical innovation and accessibility.",
      color: "from-primary-500 to-primary-600",
    },
    {
      title: "Our Vision",
      description:
        "At Nexlife International, our vision is to enhance global access to high-quality, affordable pharmaceutical products. We envision a world where quality healthcare is accessible to everyone, regardless of geographical boundaries.",
      color: "from-secondary-500 to-secondary-600",
    },
    {
      title: "Our Goal",
      description:
        "At Nexlife International, our overarching goal is to lead the pharmaceutical export industry through innovation, reliability, and customer-centric approaches. We strive to become the most trusted partner in global pharmaceutical trade.",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const officeImages = [
    {
      id: 1,
      title: "Modern Office Building",
      description: "Our state-of-the-art corporate headquarters",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: "Manufacturing Facility",
      description: "ISO certified production units",
      icon: Factory,
      color: "from-green-500 to-green-600",
    },
    {
      id: 3,
      title: "Logistics Center",
      description: "Efficient supply chain management",
      icon: Truck,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: 4,
      title: "Warehouse Facility",
      description: "Secure storage and distribution",
      icon: Warehouse,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: 5,
      title: "Quality Control Lab",
      description: "Rigorous testing and validation",
      icon: Microscope,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      id: 6,
      title: "Research & Development",
      description: "Innovation and product development",
      icon: TestTube,
      color: "from-pink-500 to-pink-600",
    },
    {
      id: 7,
      title: "Certification Center",
      description: "International standards compliance",
      icon: Award,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      id: 8,
      title: "Global Operations",
      description: "Worldwide presence and reach",
      icon: Globe,
      color: "from-teal-500 to-teal-600",
    },
  ];

  // Optimized animation variants - memoized to prevent recreating on every render
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Reduced from 0.2 for faster perception
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4, // Reduced from 0.5 for snappier feel
      },
    },
  }), []);

  const tileVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.9 }, // Removed rotateY for better performance
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.03, // Reduced from 1.05 for subtler effect
      y: -8, // Reduced from -10
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  }), []);

  const [statsInView, setStatsInView] = useState(false);

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
        whileHover={{ scale: 1.05 }}
        className="group rounded-2xl ring-1 ring-white/30 bg-white/10 backdrop-blur p-6 hover:bg-white/15 transition-all duration-300"
      >
        <div className="text-3xl md:text-4xl font-extrabold text-white mb-1 group-hover:scale-105 transition-transform">
          {display}
          {suffix}
        </div>
        <div className="text-white/90 text-xs md:text-sm font-medium">
          {label}
        </div>
      </motion.div>
    );
  };

  const handleDownload = () => {
    // Download the product catalogue PDF from Google Drive
    const pdfUrl =
      "https://drive.google.com/file/d/1Ct4xhTjZbbe-XoAjZZor7N74_YwWZPYC/view?usp=sharing";

    // Convert Google Drive sharing link to direct download link
    const fileId = "1Ct4xhTjZbbe-XoAjZZor7N74_YwWZPYC";
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Create a temporary link element to trigger download
    const link = document.createElement("a");
    link.href = directDownloadUrl;
    link.download = "Nexlife_International_Product_Catalogue.pdf";
    // Removed target="_blank" to prevent opening new tab

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Carousel state and functionality
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const autoSlideRef = useRef(null);

  const heroImages = useMemo(() => [
    { src: heroImage, alt: "Pharmaceutical logistics" },
    { src: heroImage2, alt: "Global pharmaceutical network" },
    { src: heroImage3, alt: "International trade" },
  ], []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  }, [heroImages.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    // Auto-slide functionality
    const autoSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    autoSlideRef.current = setInterval(autoSlide, 5000); // Increased to 5 seconds for better performance

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [heroImages.length]);

  // Pause auto-slide on hover - memoized
  const handleCarouselHover = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
  }, []);

  const handleCarouselLeave = useCallback(() => {
    autoSlideRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Increased to 5 seconds for better performance
  }, [heroImages.length]);

  // Office Gallery auto-scroll state and handlers
  const officeGalleryRef = useRef(null);
  const officeAutoRef = useRef(null);
  const officeIndexRef = useRef(0);
  const [officeIndex, setOfficeIndex] = useState(0);
  const [officeDirection, setOfficeDirection] = useState(1); // 1: LTR, -1: RTL

  // Floating contact buttons state
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);

  // Auto tick that continuously spins through all 6 images in a loop
  const officeAutoTick = useCallback(() => {
    const container = officeGalleryRef.current;
    if (!container) {
      return;
    }

    const total = 6; // Original 6 images
    const current = officeIndexRef.current;
    const nextIndex = (current + 1) % total;

    // Calculate scroll position (320px width + 24px gap = 344px per image)
    const scrollPosition = nextIndex * 344;

    // Update the ref immediately
    officeIndexRef.current = nextIndex;

    // Smooth scroll to next image
    container.scrollTo({ left: scrollPosition, behavior: "smooth" });
    setOfficeIndex(nextIndex);

    // If we just scrolled to the last original image (index 5), reset to start seamlessly
    if (nextIndex === 5) {
      // After the smooth scroll completes, instantly jump back to start for seamless loop
      setTimeout(() => {
        container.scrollTo({ left: 0, behavior: "auto" });
        officeIndexRef.current = 0;
        setOfficeIndex(0);
      }, 1000); // Wait for smooth scroll to complete
    }
  }, []);

  useEffect(() => {
    // start auto scroll - increased interval for better performance
    if (officeAutoRef.current) clearInterval(officeAutoRef.current);
    officeAutoRef.current = setInterval(officeAutoTick, 4000); // Increased from 3000ms
    return () => {
      if (officeAutoRef.current) clearInterval(officeAutoRef.current);
      officeAutoRef.current = null;
    };
  }, [officeAutoTick]); // Added dependency

  // Cleanup all intervals on component unmount
  useEffect(() => {
    return () => {
      if (officeAutoRef.current) {
        clearInterval(officeAutoRef.current);
        officeAutoRef.current = null;
      }
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-14 h-14  rounded-lg flex items-center justify-center">
                    <img
                      src={logoImage}
                      alt="Nexlife Logo"
                      className="w-7 h-7"
                    />
                  </div>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    Nexlife International
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
              >
                Find The Solution For Your{" "}
                <span className="text-blue-600 dark:text-blue-400">Health</span>{" "}
                Here
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                At Nexlife International, we are committed to providing
                high-quality pharmaceutical solutions that improve lives
                worldwide. Our comprehensive range of products and services
                ensures healthcare providers have access to the best solutions
                for their patients.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center space-x-2 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 hover:shadow-2xl transform transition-all duration-300 shadow-lg w-full sm:w-auto h-14"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Get Started</span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-full sm:w-auto"
                >
                  <DownloadButton onClick={handleDownload}>
                    Product Catalogue
                  </DownloadButton>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Side - Hero Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div
                className="relative w-full h-96 rounded-2xl overflow-hidden border-2 border-black shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.3)]"
                onMouseEnter={handleCarouselHover}
                onMouseLeave={handleCarouselLeave}
              >
                {/* Carousel Images */}
                {heroImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: index === currentSlide ? 1 : 0,
                      scale: index === currentSlide ? 1 : 1.05,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading={index === 0 ? "eager" : "lazy"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
                    {/* GlowingEffect disabled for better performance */}
                  </motion.div>
                ))}

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-20 border border-white/30 shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-20 border border-white/30 shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-200 border border-white/50 ${
                        index === currentSlide
                          ? "bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Floating Elements */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-24 h-24 bg-blue-200/40 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-36 h-36 bg-green-200/40 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-200/30 rounded-full blur-lg"
        />
      </section>

      {/* Pharmaceutical Products Section */}
      <section className="section-padding bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"></div>
        <div className="container-custom relative z-10">
          {/* 4 Product Cards in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tablets & Capsules Tile */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              whileHover={{ y: -5, scale: 1.01, rotateY: 3 }}
              className="group bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 p-4 rounded-xl shadow-md hover:shadow-blue-500/20 transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-400 overflow-hidden relative"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-blue-200/15 to-blue-100/20 dark:from-blue-800/10 dark:via-blue-700/10 dark:to-blue-800/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2">
                  <Pill className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Tablets & Capsules
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-3">
                  Advanced formulation technology with enhanced bioavailability.
                </p>

                {/* 4 Feature Options */}
                <div className="space-y-1.5 text-sm md:text-base text-gray-500 dark:text-gray-400">
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-200">
                      Enteric Coated
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-200">
                      Sustained Release
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-200">
                      Immediate Release
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-200">
                      Enhanced Bioavailability
                    </span>
                  </div>
                </div>
              </div>

              {/* Particles Effect */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></div>
            </motion.div>

            {/* Dry Syrup & Suspensions Tile */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -5, scale: 1.01, rotateY: -3 }}
              className="group bg-gradient-to-br from-white via-green-50 to-white dark:from-gray-800 dark:via-green-900/20 dark:to-gray-800 p-4 rounded-xl shadow-md hover:shadow-green-500/20 transition-all duration-300 border border-transparent hover:border-green-200 dark:hover:border-green-400 overflow-hidden relative"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 via-green-200/15 to-green-100/20 dark:from-green-800/10 dark:via-green-700/10 dark:to-green-800/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2">
                  <TestTube className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                  Dry Syrup & Suspensions
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-3">
                  Pediatric-friendly formulations with superior taste masking
                  and stability.
                </p>

                {/* 4 Feature Options */}
                <div className="space-y-1.5 text-sm md:text-base text-gray-500 dark:text-gray-400">
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-green-600 dark:group-hover/item:text-green-400 transition-colors duration-200">
                      Taste Masked
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-green-600 dark:group-hover/item:text-green-400 transition-colors duration-200">
                      Extended Shelf Life
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-green-600 dark:group-hover/item:text-green-400 transition-colors duration-200">
                      Pediatric Friendly
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-green-600 dark:group-hover/item:text-green-400 transition-colors duration-200">
                      Easy Reconstitution
                    </span>
                  </div>
                </div>
              </div>

              {/* Particles Effect */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-green-300 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></div>
            </motion.div>

            {/* Surgical & Medical Devices Tile */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ y: -5, scale: 1.01, rotateY: 3 }}
              className="group bg-gradient-to-br from-white via-purple-50 to-white dark:from-gray-800 dark:via-purple-900/20 dark:to-gray-800 p-4 rounded-xl shadow-md hover:shadow-purple-500/20 transition-all duration-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-400 overflow-hidden relative"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-purple-200/15 to-purple-100/20 dark:from-purple-800/10 dark:via-purple-700/10 dark:to-purple-800/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  Surgical & Medical Devices
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-3">
                  Sterile, precision-engineered surgical instruments and medical
                  devices meeting international standards.
                </p>

                {/* 4 Feature Options */}
                <div className="space-y-1.5 text-sm md:text-base text-gray-500 dark:text-gray-400">
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-200">
                      Sterile Packaging
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-200">
                      Precision Engineering
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-200">
                      International Standards
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-200">
                      Critical Care Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Particles Effect */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></div>
            </motion.div>

            {/* Injectables & Parenterals Tile */}
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ y: -5, scale: 1.01, rotateY: -3 }}
              className="group bg-gradient-to-br from-white via-orange-50 to-white dark:from-gray-800 dark:via-orange-900/20 dark:to-gray-800 p-4 rounded-xl shadow-md hover:shadow-orange-500/20 transition-all duration-300 border border-transparent hover:border-orange-200 dark:hover:border-orange-400 overflow-hidden relative"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-orange-200/15 to-orange-100/20 dark:from-orange-800/10 dark:via-orange-700/10 dark:to-orange-800/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-orange-500/40 transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2">
                  <TestTube className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                  Injectables & Parenterals
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-3">
                  Sterile injectable solutions for critical care and emergency
                  medicine.
                </p>

                {/* 4 Feature Options */}
                <div className="space-y-1.5 text-sm md:text-base text-gray-500 dark:text-gray-400">
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors duration-200">
                      Sterile Solutions
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors duration-200">
                      Critical Care
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors duration-200">
                      Emergency Medicine
                    </span>
                  </div>
                  <div className="flex items-center group/item">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 group-hover/item:scale-110 transition-transform duration-200"></div>
                    <span className="group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors duration-200">
                      High Bioavailability
                    </span>
                  </div>
                </div>
              </div>

              {/* Particles Effect */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-orange-300 rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Medicines Of The Week Section */}
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
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 inline-block"
              >
                Our Products
              </motion.h2>
              <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Discover our comprehensive range of high-quality pharmaceutical
              products, manufactured with precision and delivered with
              excellence to healthcare providers worldwide.
            </motion.p>
          </motion.div>

          {/* Featured Products Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Product Card 1 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-300 dark:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400 overflow-hidden group relative"
              style={{
                boxShadow: "0 0 20px rgba(236, 72, 153, 0.12)",
              }}
            >
              {/* Border Edge Lighting Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-black/20 via-fuchsia-500/25 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative overflow-hidden">
                <img
                  src={product1}
                  alt="Premium Antibiotic Formula"
                  loading="lazy"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                />

                <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Antibiotics
                </div>
              </div>

              <div className="p-6 relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Premium Antibiotic Formula
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Advanced broad-spectrum antibiotic for severe infections with
                  enhanced efficacy and minimal side effects.
                </p>
              </div>
            </motion.div>

            {/* Product Card 2 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-300 dark:border-red-500 hover:border-red-400 dark:hover:border-red-400 overflow-hidden group relative"
              style={{
                boxShadow: "0 0 20px rgba(236, 72, 153, 0.12)",
              }}
            >
              {/* Border Edge Lighting Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-black/20 via-fuchsia-500/25 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative overflow-hidden">
                <img
                  src={product2}
                  alt="Advanced Pain Relief Formula"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                />

                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Pain Reliever
                </div>
              </div>

              <div className="p-6 relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Advanced Pain Relief Formula
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Fast-acting pain relief medication for acute and chronic pain
                  management with proven efficacy and safety.
                </p>
              </div>
            </motion.div>

            {/* Product Card 3 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-300 dark:border-orange-500 hover:border-orange-400 dark:hover:border-orange-400 overflow-hidden group relative"
              style={{
                boxShadow: "0 0 20px rgba(236, 72, 153, 0.12)",
              }}
            >
              {/* Border Edge Lighting Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-black/20 via-fuchsia-500/25 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative overflow-hidden">
                <img
                  src={product3}
                  alt="Pain Relief Advanced"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                />

                <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Pain Reliever
                </div>
              </div>

              <div className="p-6 relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Pain Relief Advanced
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Advanced pain management solution with dual-action formula for
                  effective relief from moderate to severe pain.
                </p>
              </div>
            </motion.div>

            {/* Product Card 4 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-300 dark:border-red-500 hover:border-red-400 dark:hover:border-red-400 overflow-hidden group relative"
              style={{
                boxShadow: "0 0 20px rgba(236, 72, 153, 0.12)",
              }}
            >
              {/* Border Edge Lighting Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-black/20 via-fuchsia-500/25 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative overflow-hidden">
                <img
                  src={product4}
                  alt="Cardiovascular Health Plus"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                />

                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Cardiovascular
                </div>
              </div>

              <div className="p-6 relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Cardiovascular Health Plus
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Comprehensive heart health supplement with natural ingredients
                  for optimal cardiovascular function.
                </p>
              </div>
            </motion.div>

            {/* Product Card 5 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-300 dark:border-green-500 hover:border-green-400 dark:hover:border-green-400 overflow-hidden group relative"
              style={{
                boxShadow: "0 0 20px rgba(236, 72, 153, 0.12)",
              }}
            >
              {/* Border Edge Lighting Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-black/20 via-fuchsia-500/25 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative overflow-hidden">
                <img
                  src={product5}
                  alt="Multivitamins Complete"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                />

                <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Multivitamins
                </div>
              </div>

              <div className="p-6 relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Multivitamins Complete
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Comprehensive multivitamin formula with essential nutrients
                  for overall health and wellness support.
                </p>
              </div>
            </motion.div>

            {/* Product Card 6 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-300 dark:border-purple-500 hover:border-purple-400 dark:hover:border-purple-400 overflow-hidden group relative"
              style={{
                boxShadow: "0 0 20px rgba(236, 72, 153, 0.12)",
              }}
            >
              {/* Border Edge Lighting Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-black/20 via-fuchsia-500/25 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative overflow-hidden">
                <img
                  src={product6}
                  alt="Anti Allergic Formula"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                />

                <div className="absolute top-4 left-4 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Anti Allergic
                </div>
              </div>

              <div className="p-6 relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Anti Allergic Formula
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Advanced anti-allergic medication for effective relief from
                  seasonal allergies and allergic reactions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section - Enhanced Tiles */}
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
                Why Choose Us?
              </motion.h2>
              <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              We are committed to delivering excellence in every aspect of our
              pharmaceutical services.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {whyChooseUs.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={tileVariants}
                whileHover="hover"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400"
              >
                <div className="p-8 relative z-10">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.08 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* NEXLIFE INTERNATIONAL STANDS FOR Section - Enhanced Tiles */}
      <section className="section-padding bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
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
                NEXLIFE INTERNATIONAL STANDS FOR
              </motion.h2>
              <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              The four pillars that define our company's foundation and drive
              our success.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {companyPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                variants={tileVariants}
                whileHover="hover"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400 transform perspective-1000"
              >
                <div className="p-6 relative z-10">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.08 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${pillar.color} flex items-center justify-center shadow-lg`}
                  >
                    <pillar.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center text-sm">
                    {pillar.description}
                  </p>
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  whileHover={{ x: [0, 100, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Goal Section - Enhanced Cards */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
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
                Our Core Values
              </motion.h2>
              <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Understanding our mission, vision, and goals helps you know what
              drives us forward.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
          >
            {companyInfo.map((info, index) => (
              <div
                key={info.title}
                className="neon-rotate-border group h-full"
                style={{ borderRadius: "1rem" }}
              >
                <div className="neon-border-bg" />
                <motion.div
                  variants={tileVariants}
                  whileHover="hover"
                  className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 h-full flex flex-col"
                >
                  <div className="p-8 relative z-10 flex-1 flex flex-col">
                    <motion.div
                      whileHover={{ y: -6, scale: 1.08 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-r ${info.color} flex items-center justify-center shadow-lg`}
                    >
                      <Shield className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {info.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                      {info.description}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Office Gallery Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-block mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 inline-block"
              >
                Our Office & Facilities
              </motion.h2>
              <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Take a virtual tour of our modern office spaces and world-class
              facilities
            </motion.p>
          </motion.div>

          {/* Office Gallery Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative"
          >
            {/* Auto-scrolling Gallery */}
            <div className="overflow-hidden">
              <div
                className="flex gap-6 office-gallery-container scroll-smooth overflow-x-auto w-full office-glass-container"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                ref={officeGalleryRef}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const container = e.currentTarget;
                  container.dataset.touchStartX = touch.clientX;
                  container.dataset.scrollLeft = container.scrollLeft;
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const container = e.currentTarget;
                  const touchStartX = parseFloat(
                    container.dataset.touchStartX || "0"
                  );
                  const scrollLeft = parseFloat(
                    container.dataset.scrollLeft || "0"
                  );
                  const diff = touchStartX - touch.clientX;
                  container.scrollLeft = scrollLeft + diff;
                }}
              >
                {/* Office Image 1 */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office1}
                      alt="Modern Office Space"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Office Image 2 */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office2}
                      alt="Executive Office"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Office Image 3 */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office3}
                      alt="Meeting Room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Office Image 4 */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office4}
                      alt="Reception Area"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Office Image 5 */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office5}
                      alt="Workstation Area"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Office Image 6 */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office6}
                      alt="Conference Room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Duplicate images for seamless loop */}
                {/* Office Image 1 - Duplicate */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office1}
                      alt="Modern Office Space"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Office Image 2 - Duplicate */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office2}
                      alt="Executive Office"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Office Image 3 - Duplicate */}
                <div className="flex-shrink-0 office-card">
                  <div className="w-80 h-64 rounded-3xl overflow-hidden relative shadow-lg">
                    <img
                      src={office3}
                      alt="Meeting Room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Indicators - removed per request */}
          </motion.div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 inline-block"
              >
                What Our Customers Say
              </motion.h2>
              <div className="h-1 w-11/12 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Trusted by healthcare professionals worldwide. Read authentic
              reviews from our satisfied customers.
            </motion.p>
          </motion.div>

          {/* Reviews Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Review Card 1 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-500 hover:border-blue-400 dark:hover:border-blue-400"
            >
              <div className="p-6 relative z-10">
                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      className={`h-5 w-5 ${
                        i < 5 ? "text-yellow-400" : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.916 1.603-.916 1.902 0l1.286 3.953a1.5 1.5 0 001.421 1.033h4.171c.949 0 1.341 1.154.577 1.715l-3.38 2.458a1.5 1.5 0 00-.54 1.659l1.286 3.953c.3.916-.757 1.67-1.539 1.145l-3.38-2.458a1.5 1.5 0 00-1.76 0l-3.38 2.458c-.782.525-1.838-.229-1.539-1.145l1.286-3.953a1.5 1.5 0 00-.54-1.659l-3.38-2.458c-.764-.561-.372-1.715.577-1.715h4.171a1.5 1.5 0 001.421-1.033l1.286-3.953z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "As a hospital administrator in Mumbai, I've been working with
                  Nexlife International for over 4 years. Their antibiotics and
                  cardiovascular medications have significantly improved our
                  patient outcomes. The quality is consistently excellent, and
                  their team always responds within hours to any queries.
                  They've helped us reduce costs by 25% while maintaining the
                  highest standards."
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    RK
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Dr. Rajesh Kumar
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Medical Superintendent, Apollo Hospital Mumbai
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            {/* Review Card 2 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-green-200 dark:border-green-500 hover:border-green-400 dark:hover:border-green-400"
            >
              <div className="p-6 relative z-10">
                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      className={`h-5 w-5 ${
                        i < 5 ? "text-yellow-400" : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.916 1.603-.916 1.902 0l1.286 3.953a1.5 1.5 0 001.421 1.033h4.171c.949 0 1.341 1.154.577 1.715l-3.38 2.458a1.5 1.5 0 00-.54 1.659l1.286 3.953c.3.916-.757 1.67-1.539 1.145l-3.38-2.458a1.5 1.5 0 00-1.76 0l-3.38 2.458c-.782.525-1.838-.229-1.539-1.145l1.286-3.953a1.5 1.5 0 00-.54-1.659l-3.38-2.458c-.764-.561-.372-1.715.577-1.715h4.171a1.5 1.5 0 001.421-1.033l1.286-3.953z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "I run a chain of 12 pharmacies across Delhi NCR, and Nexlife
                  has been our primary supplier for the past 3 years. Their
                  diabetes management products and pain relief medications are
                  top-notch. What impresses me most is their logistics - we've
                  never missed a single order deadline, even during the
                  pandemic. Their technical support team is incredibly
                  knowledgeable."
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    PS
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Priya Sharma
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Director, MedPlus Pharmacy Chain
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            {/* Review Card 3 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-500 hover:border-purple-400 dark:hover:border-purple-400"
            >
              <div className="p-6 relative z-10">
                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      className={`h-5 w-5 ${
                        i < 5 ? "text-yellow-400" : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.916 1.603-.916 1.902 0l1.286 3.953a1.5 1.5 0 001.421 1.033h4.171c.949 0 1.341 1.154.577 1.715l-3.38 2.458a1.5 1.5 0 00-.54 1.659l1.286 3.953c.3.916-.757 1.67-1.539 1.145l-3.38-2.458a1.5 1.5 0 00-1.76 0l-3.38 2.458c-.782.525-1.838-.229-1.539-1.145l1.286-3.953a1.5 1.5 0 00-.54-1.659l-3.38-2.458c-.764-.561-.372-1.715.577-1.715h4.171a1.5 1.5 0 001.421-1.033l1.286-3.953z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "As a clinical research organization in Bangalore, we've been
                  sourcing investigational drugs from Nexlife for our Phase II
                  and III trials. Their GMP compliance and documentation are
                  impeccable. The team understands regulatory requirements
                  perfectly and has helped us navigate complex approval
                  processes. Their products meet international standards
                  consistently."
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    AK
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Dr. Arjun Krishnan
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Chief Scientific Officer, BioResearch India
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            {/* Review Card 4 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-orange-200 dark:border-orange-500 hover:border-orange-400 dark:hover:border-orange-400"
            >
              <div className="p-6 relative z-10">
                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      className={`h-5 w-5 ${
                        i < 4 ? "text-yellow-400" : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.916 1.603-.916 1.902 0l1.286 3.953a1.5 1.5 0 001.421 1.033h4.171c.949 0 1.341 1.154.577 1.715l-3.38 2.458a1.5 1.5 0 00-.54 1.659l1.286 3.953c.3.916-.757 1.67-1.539 1.145l-3.38-2.458a1.5 1.5 0 00-1.76 0l-3.38 2.458c-.782.525-1.838-.229-1.539-1.145l1.286-3.953a1.5 1.5 0 00-.54-1.659l-3.38-2.458c-.764-.561-.372-1.715.577-1.715h4.171a1.5 1.5 0 001.421-1.033l1.286-3.953z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "I manage procurement for a network of 8 hospitals in Chennai.
                  Nexlife's oncology medications and critical care drugs have
                  been lifesavers. Their cold chain management is exceptional,
                  and they've never compromised on temperature-sensitive
                  products. The only minor issue is sometimes longer lead times
                  for specialty drugs, but quality is never compromised."
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    MV
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Meera Venkatesh
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Head of Procurement, Chennai Healthcare Network
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            {/* Review Card 5 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-teal-200 dark:border-teal-500 hover:border-teal-400 dark:hover:border-teal-400"
            >
              <div className="p-6 relative z-10">
                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      className={`h-5 w-5 ${
                        i < 5 ? "text-yellow-400" : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.916 1.603-.916 1.902 0l1.286 3.953a1.5 1.5 0 001.421 1.033h4.171c.949 0 1.341 1.154.577 1.715l-3.38 2.458a1.5 1.5 0 00-.54 1.659l1.286 3.953c.3.916-.757 1.67-1.539 1.145l-3.38-2.458a1.5 1.5 0 00-1.76 0l-3.38 2.458c-.782.525-1.838-.229-1.539-1.145l1.286-3.953a1.5 1.5 0 00-.54-1.659l-3.38-2.458c-.764-.561-.372-1.715.577-1.715h4.171a1.5 1.5 0 001.421-1.033l1.286-3.953z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "Our rural healthcare centers in Kerala have been sourcing
                  medicines from Nexlife for the past 5 years. Their generic
                  medications have made quality healthcare affordable for our
                  patients. The team understands the challenges of rural
                  healthcare and has customized solutions for us. Their
                  emergency supply system has saved countless lives during
                  natural disasters."
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    SJ
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Dr. Sunita Joseph
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Medical Director, Rural Health Mission Kerala
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            {/* Review Card 6 */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-pink-200 dark:border-pink-500 hover:border-pink-400 dark:hover:border-pink-400"
            >
              <div className="p-6 relative z-10">
                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      className={`h-5 w-5 ${
                        i < 5 ? "text-yellow-400" : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.916 1.603-.916 1.902 0l1.286 3.953a1.5 1.5 0 001.421 1.033h4.171c.949 0 1.341 1.154.577 1.715l-3.38 2.458a1.5 1.5 0 00-.54 1.659l1.286 3.953c.3.916-.757 1.67-1.539 1.145l-3.38-2.458a1.5 1.5 0 00-1.76 0l-3.38 2.458c-.782.525-1.838-.229-1.539-1.145l1.286-3.953a1.5 1.5 0 00-.54-1.659l-3.38-2.458c-.764-.561-.372-1.715.577-1.715h4.171a1.5 1.5 0 001.421-1.033l1.286-3.953z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "I've been importing Nexlife's products to our hospitals in
                  Dubai for 6 years now. Their international compliance and
                  export documentation are flawless. The products consistently
                  pass our stringent quality checks, and their after-sales
                  support is exceptional. They've helped us expand our formulary
                  with innovative products that weren't available locally."
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    AA
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Dr. Ahmed Al-Rashid
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Chief Medical Officer, Emirates Medical Center
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Ready to Partner With Us?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              Join hundreds of healthcare providers worldwide who trust Nexlife
              International for their pharmaceutical needs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transform transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  Get Started Today
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary-600 transform transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  View Our Products
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Animation Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            rotate: [0, 3, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-lg"
        />
        <motion.div
          animate={{
            y: [0, 25, 0],
            x: [0, -20, 0],
            rotate: [0, -3, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-lg"
        />
      </section>

      {/* Global Stats Strip */}
      <section className="py-16 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Our Global Impact
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-white/90 max-w-2xl mx-auto"
            >
              Numbers that tell the story of our commitment to global healthcare
            </motion.p>
          </motion.div>

          {/* New Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Countries Served */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 hover:border-white/40 transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/10">
                {/* Floating Icon */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Number Display */}
                <div className="mt-6">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                      <CountUp end={50} suffix="+" duration={2.5} />
                    </span>
                  </div>
                  <div className="text-white/90 font-semibold text-lg">
                    Countries Served
                  </div>
                  <div className="text-white/70 text-sm mt-2">Global Reach</div>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>

            {/* Healthcare Partners */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 hover:border-white/40 transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/10">
                {/* Floating Icon */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Number Display */}
                <div className="mt-6">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                      <CountUp end={1000} suffix="+" duration={2.5} />
                    </span>
                  </div>
                  <div className="text-white/90 font-semibold text-lg">
                    Healthcare Partners
                  </div>
                  <div className="text-white/70 text-sm mt-2">
                    Trusted Worldwide
                  </div>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>

            {/* Years Experience */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 hover:border-white/40 transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/10">
                {/* Floating Icon */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Number Display */}
                <div className="mt-6">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="bg-gradient-to-r from-orange-300 to-orange-100 bg-clip-text text-transparent">
                      <CountUp end={15} suffix="+" duration={2.5} />
                    </span>
                  </div>
                  <div className="text-white/90 font-semibold text-lg">
                    Years Experience
                  </div>
                  <div className="text-white/70 text-sm mt-2">
                    Proven Excellence
                  </div>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>

            {/* Quality Assurance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 hover:border-white/40 transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:shadow-white/10">
                {/* Floating Icon */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Number Display */}
                <div className="mt-6">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="bg-gradient-to-r from-purple-300 to-purple-100 bg-clip-text text-transparent">
                      <CountUp
                        end={99.9}
                        suffix="%"
                        duration={2.5}
                        decimals={1}
                      />
                    </span>
                  </div>
                  <div className="text-white/90 font-semibold text-lg">
                    Quality Assurance
                  </div>
                  <div className="text-white/70 text-sm mt-2">
                    Uncompromising
                  </div>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-white/80 text-sm max-w-2xl mx-auto">
              Join thousands of healthcare professionals who trust Nexlife
              International for their pharmaceutical needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-block mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 inline-block"
              >
                Our Certifications & Standards
              </motion.h2>
              <div className="h-1 w-full mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Nexlife International maintains the highest standards of quality,
              safety, and compliance through internationally recognized
              certifications and regulatory approvals.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center"
          >
            <img
              src={certificationImage}
              alt="Certifications and Standards"
              className="max-w-full h-auto max-h-96 object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* Debug Info - Only in Development */}
      <DebugInfo />

      {/* Floating Contact Buttons */}
      <div className="fixed right-6 bottom-6 z-50">
        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: isFloatingOpen ? 1 : 0,
            scale: isFloatingOpen ? 1 : 0.8,
            y: isFloatingOpen ? 0 : 20,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`mb-4 space-y-3 ${isFloatingOpen ? "block" : "hidden"}`}
        >
          {/* WhatsApp Button */}
          <motion.a
            href="https://wa.me/919664843790"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">WhatsApp</span>
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          </motion.a>

          {/* Call Button */}
          <motion.a
            href="tel:+919664843790"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Phone className="w-5 h-5" />
            <span className="text-sm font-medium">Call Now</span>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
          </motion.a>

          {/* Email Button */}
          <motion.a
            href="mailto:info@nexlifeinternational.com"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm font-medium">Email Us</span>
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
          </motion.a>
        </motion.div>

        {/* Main Toggle Button */}
        <motion.button
          onClick={() => setIsFloatingOpen(!isFloatingOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <motion.div
            animate={{ rotate: isFloatingOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isFloatingOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </motion.div>

          {/* Pulse Animation */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-30"
          />
        </motion.button>
      </div>
    </div>
  );
};

export default Home;
