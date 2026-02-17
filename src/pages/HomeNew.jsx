import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Globe,
  Users,
  Award,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Mail,
  X,
  Building2,
  Factory,
  Truck,
  Warehouse,
  Microscope,
  TestTube,
  Star,
} from "lucide-react";
import DownloadButton from "../components/DownloadButton";
import DebugInfo from "../components/DebugInfo";

// Images
import backgroundImage from "../assets/images/background.png";
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
import pillsImage from "../assets/images/home/pills (1).png";
import syrupImage from "../assets/images/home/syrup.png";
import surgeryImage from "../assets/images/home/surgery.png";
import medicalEquipmentImage from "../assets/images/home/medical-equipment.png";
import clientSatisfactionImage from "../assets/images/home/Client Satisfaction.png";
import competitivePricingImage from "../assets/images/home/Competitive Pricing.png";
import supplyChainImage from "../assets/images/home/Supply Chain Reliability.png";
import employeesImage from "../assets/images/home/EMPLOYEE'S.png";
import medicineImage from "../assets/images/home/MEDICINE.png";
import customersImage from "../assets/images/home/CUSTOMERS.png";
import countriesImage from "../assets/images/home/COUNTRIES.png";
import ourMissionImage from "../assets/images/home/our mission.png";
import ourVisionImage from "../assets/images/home/Our Vision.png";
import ourGoalImage from "../assets/images/home/Our Goal.png";
import callNowImage from "../assets/images/home/call now.png";
import certificationImage from "../assets/images/image.png";

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

/* ─────────────────────────  CountUp  ───────────────────────── */
const AnimatedCounter = memo(({ end, suffix = "", decimals = 0, duration = 2000 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const start = 0;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = start + (end - start) * eased;
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? value.toFixed(decimals) : value}
      {suffix}
    </span>
  );
});

/* ─────────────────────────  Section Heading  ───────────────────────── */
const SectionHeading = ({ title, subtitle }) => {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`text-center mb-12 md:mb-16 transition-[opacity,transform] duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 inline-block">
        {title}
      </h2>
      <div className="h-1 w-3/4 mx-auto mb-4 rounded-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────  Star Rating  ───────────────────────── */
const StarRating = ({ count = 5 }) => (
  <div className="flex items-center gap-0.5 mb-4">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const HomeNew = () => {
  const { t } = useTranslation();

  /* ── Carousel state (infinite loop) ── */
  const [currentSlide, setCurrentSlide] = useState(1); // start at 1 (first real slide in extended array)
  const [isTransitioning, setIsTransitioning] = useState(true);
  const autoSlideRef = useRef(null);
  const carouselRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchDeltaRef = useRef(0);

  const heroImages = [
    { src: heroImage, alt: "Pharmaceutical logistics" },
    { src: heroImage2, alt: "Global pharmaceutical network" },
    { src: heroImage3, alt: "International trade" },
  ];

  // Extended slides: [last, ...originals, first] for seamless infinite loop
  const extendedSlides = [
    heroImages[heroImages.length - 1],
    ...heroImages,
    heroImages[0],
  ];
  const totalExtended = extendedSlides.length;

  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((p) => p + 1);
    }, 4000);
  }, []);

  // Handle seamless loop reset after transition ends
  const handleTransitionEnd = useCallback(() => {
    if (currentSlide >= totalExtended - 1) {
      // Jumped past last real slide -> snap to first real
      setIsTransitioning(false);
      setCurrentSlide(1);
    } else if (currentSlide <= 0) {
      // Jumped before first real slide -> snap to last real
      setIsTransitioning(false);
      setCurrentSlide(heroImages.length);
    }
  }, [currentSlide, totalExtended, heroImages.length]);

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current);
  }, [startAutoSlide]);

  // Re-enable transition after seamless snap
  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsTransitioning(true));
      });
    }
  }, [isTransitioning]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((p) => p + 1);
    startAutoSlide();
  };
  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((p) => p - 1);
    startAutoSlide();
  };
  const goToSlide = (i) => {
    setIsTransitioning(true);
    setCurrentSlide(i + 1); // offset by 1 because of prepended clone
    startAutoSlide();
  };

  // Real slide index (0-based) for indicator dots
  const realSlideIndex = currentSlide <= 0
    ? heroImages.length - 1
    : currentSlide >= totalExtended - 1
    ? 0
    : currentSlide - 1;

  // Touch/swipe handling
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
    touchDeltaRef.current = 0;
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  };

  const handleTouchMove = (e) => {
    if (touchStartRef.current === null) return;
    touchDeltaRef.current = e.touches[0].clientX - touchStartRef.current;
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaRef.current;
    const threshold = 50;
    if (Math.abs(delta) > threshold) {
      if (delta < 0) nextSlide();
      else prevSlide();
    }
    touchStartRef.current = null;
    touchDeltaRef.current = 0;
    startAutoSlide();
  };

  /* ── Reviews carousel state ── */
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewAutoRef = useRef(null);
  const [itemsPerView, setItemsPerView] = useState(3);
  const reviewTouchStartRef = useRef(null);
  const reviewTouchDeltaRef = useRef(0);

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxReviewIndex = Math.max(0, 6 - itemsPerView); // 6 reviews total

  const startReviewAutoSlide = useCallback(() => {
    if (reviewAutoRef.current) clearInterval(reviewAutoRef.current);
    reviewAutoRef.current = setInterval(() => {
      setReviewIndex((p) => (p >= maxReviewIndex ? 0 : p + 1));
    }, 5000);
  }, [maxReviewIndex]);

  useEffect(() => {
    startReviewAutoSlide();
    return () => clearInterval(reviewAutoRef.current);
  }, [startReviewAutoSlide]);

  const nextReview = () => {
    setReviewIndex((p) => (p >= maxReviewIndex ? 0 : p + 1));
    startReviewAutoSlide();
  };
  const prevReview = () => {
    setReviewIndex((p) => (p <= 0 ? maxReviewIndex : p - 1));
    startReviewAutoSlide();
  };

  // Review swipe handlers
  const handleReviewTouchStart = (e) => {
    reviewTouchStartRef.current = e.touches[0].clientX;
    reviewTouchDeltaRef.current = 0;
    if (reviewAutoRef.current) clearInterval(reviewAutoRef.current);
  };
  const handleReviewTouchMove = (e) => {
    if (reviewTouchStartRef.current === null) return;
    reviewTouchDeltaRef.current = e.touches[0].clientX - reviewTouchStartRef.current;
  };
  const handleReviewTouchEnd = () => {
    if (Math.abs(reviewTouchDeltaRef.current) > 40) {
      if (reviewTouchDeltaRef.current < 0) nextReview();
      else prevReview();
    }
    reviewTouchStartRef.current = null;
    reviewTouchDeltaRef.current = 0;
    startReviewAutoSlide();
  };

  /* ── Floating contacts ── */
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);

  /* Hide floating button when footer is visible to prevent overlap */
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsNearFooter(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  /* ── Download handler ── */
  const handleDownload = () => {
    const fileId = "1Ct4xhTjZbbe-XoAjZZor7N74_YwWZPYC";
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "Nexlife_International_Product_Catalogue.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* ── Data ── */
  const pharmaCategories = [
    {
      image: pillsImage,
      name: "Tablets & Capsules",
      desc: "Advanced formulation technology with enhanced bioavailability.",
      features: ["Enteric Coated", "Sustained Release", "Immediate Release", "Enhanced Bioavailability"],
      accent: "blue",
    },
    {
      image: syrupImage,
      name: "Dry Syrup & Suspensions",
      desc: "Pediatric-friendly formulations with superior taste masking and stability.",
      features: ["Taste Masked", "Extended Shelf Life", "Pediatric Friendly", "Easy Reconstitution"],
      accent: "green",
    },
    {
      image: surgeryImage,
      name: "Surgical & Medical Devices",
      desc: "Sterile, precision-engineered surgical instruments and medical devices meeting international standards.",
      features: ["Sterile Packaging", "Precision Engineering", "International Standards", "Critical Care Ready"],
      accent: "purple",
    },
    {
      image: medicalEquipmentImage,
      name: "Injectables & Parenterals",
      desc: "Sterile injectable solutions for critical care and emergency medicine.",
      features: ["Sterile Solutions", "Critical Care", "Emergency Medicine", "High Bioavailability"],
      accent: "orange",
    },
  ];

  const products = [
    { img: product1, name: "Premium Antibiotic Formula", tag: "Antibiotics", tagColor: "bg-blue-500", desc: "Advanced broad-spectrum antibiotic for severe infections with enhanced efficacy and minimal side effects." },
    { img: product2, name: "Advanced Pain Relief Formula", tag: "Pain Reliever", tagColor: "bg-red-500", desc: "Fast-acting pain relief medication for acute and chronic pain management with proven efficacy and safety." },
    { img: product3, name: "Pain Relief Advanced", tag: "Pain Reliever", tagColor: "bg-orange-500", desc: "Advanced pain management solution with dual-action formula for effective relief from moderate to severe pain." },
    { img: product4, name: "Cardiovascular Health Plus", tag: "Cardiovascular", tagColor: "bg-red-500", desc: "Comprehensive heart health supplement with natural ingredients for optimal cardiovascular function." },
    { img: product5, name: "Multivitamins Complete", tag: "Multivitamins", tagColor: "bg-green-500", desc: "Comprehensive multivitamin formula with essential nutrients for overall health and wellness support." },
    { img: product6, name: "Anti Allergic Formula", tag: "Anti Allergic", tagColor: "bg-purple-500", desc: "Advanced anti-allergic medication for effective relief from seasonal allergies and allergic reactions." },
  ];

  const whyChooseUs = [
    { image: clientSatisfactionImage, title: "Client Satisfaction", description: "Your satisfaction is our top priority. We aim to exceed your expectations with every interaction and delivery." },
    { image: supplyChainImage, title: "Supply Chain Reliability", description: "Timeliness is critical in the pharmaceutical industry. We ensure reliable and consistent supply chain management." },
    { image: competitivePricingImage, title: "Competitive Pricing", description: "We offer competitive and affordable pricing without compromising on quality or service standards." },
  ];

  const companyPillars = [
    { image: employeesImage, title: "EMPLOYEE'S", description: "Our dedicated team of professionals" },
    { image: medicineImage, title: "MEDICINE", description: "Quality pharmaceutical products" },
    { image: customersImage, title: "CUSTOMERS", description: "Customer satisfaction first" },
    { image: countriesImage, title: "COUNTRIES", description: "Global presence worldwide" },
  ];

  const companyInfo = [
    { image: ourMissionImage, title: "Our Mission", description: "At Nexlife International, our mission is clear: we aim to improve lives by providing affordable, high-quality pharmaceutical solutions to healthcare providers worldwide. We are committed to bridging the gap between pharmaceutical innovation and accessibility." },
    { image: ourVisionImage, title: "Our Vision", description: "At Nexlife International, our vision is to enhance global access to high-quality, affordable pharmaceutical products. We envision a world where quality healthcare is accessible to everyone, regardless of geographical boundaries." },
    { image: ourGoalImage, title: "Our Goal", description: "At Nexlife International, our overarching goal is to lead the pharmaceutical export industry through innovation, reliability, and customer-centric approaches. We strive to become the most trusted partner in global pharmaceutical trade." },
  ];

  const officeImages = [
    { src: office1, alt: "Modern Office Space" },
    { src: office2, alt: "Executive Office" },
    { src: office3, alt: "Meeting Room" },
    { src: office4, alt: "Reception Area" },
    { src: office5, alt: "Workstation Area" },
    { src: office6, alt: "Conference Room" },
  ];

  /* ── Office carousel state (infinite loop) ── */
  const [officeSlide, setOfficeSlide] = useState(1);
  const [officeTransitioning, setOfficeTransitioning] = useState(true);
  const officeAutoRef = useRef(null);
  const officeTouchStartRef = useRef(null);
  const officeTouchDeltaRef = useRef(0);

  const extendedOffice = [
    officeImages[officeImages.length - 1],
    ...officeImages,
    officeImages[0],
  ];
  const totalOfficeExtended = extendedOffice.length;

  const startOfficeAutoSlide = useCallback(() => {
    if (officeAutoRef.current) clearInterval(officeAutoRef.current);
    officeAutoRef.current = setInterval(() => {
      setOfficeTransitioning(true);
      setOfficeSlide((p) => p + 1);
    }, 3500);
  }, []);

  const handleOfficeTransitionEnd = useCallback(() => {
    if (officeSlide >= totalOfficeExtended - 1) {
      setOfficeTransitioning(false);
      setOfficeSlide(1);
    } else if (officeSlide <= 0) {
      setOfficeTransitioning(false);
      setOfficeSlide(officeImages.length);
    }
  }, [officeSlide, totalOfficeExtended]);

  useEffect(() => {
    startOfficeAutoSlide();
    return () => clearInterval(officeAutoRef.current);
  }, [startOfficeAutoSlide]);

  useEffect(() => {
    if (!officeTransitioning) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOfficeTransitioning(true));
      });
    }
  }, [officeTransitioning]);

  const realOfficeIndex = officeSlide <= 0
    ? officeImages.length - 1
    : officeSlide >= totalOfficeExtended - 1
    ? 0
    : officeSlide - 1;

  const handleOfficeTouchStart = (e) => {
    officeTouchStartRef.current = e.touches[0].clientX;
    officeTouchDeltaRef.current = 0;
    if (officeAutoRef.current) clearInterval(officeAutoRef.current);
  };
  const handleOfficeTouchMove = (e) => {
    if (officeTouchStartRef.current === null) return;
    officeTouchDeltaRef.current = e.touches[0].clientX - officeTouchStartRef.current;
  };
  const handleOfficeTouchEnd = () => {
    if (Math.abs(officeTouchDeltaRef.current) > 50) {
      setOfficeTransitioning(true);
      if (officeTouchDeltaRef.current < 0) setOfficeSlide((p) => p + 1);
      else setOfficeSlide((p) => p - 1);
    }
    officeTouchStartRef.current = null;
    officeTouchDeltaRef.current = 0;
    startOfficeAutoSlide();
  };

  const reviews = [
    { initials: "RK", name: "Dr. Rajesh Kumar", role: "Medical Superintendent, Apollo Hospital Mumbai", stars: 5, color: "from-blue-500 to-blue-600", borderColor: "border-blue-200 dark:border-blue-500", text: "As a hospital administrator in Mumbai, I've been working with Nexlife International for over 4 years. Their antibiotics and cardiovascular medications have significantly improved our patient outcomes. The quality is consistently excellent, and their team always responds within hours to any queries. They've helped us reduce costs by 25% while maintaining the highest standards." },
    { initials: "PS", name: "Priya Sharma", role: "Director, MedPlus Pharmacy Chain", stars: 5, color: "from-green-500 to-green-600", borderColor: "border-green-200 dark:border-green-500", text: "I run a chain of 12 pharmacies across Delhi NCR, and Nexlife has been our primary supplier for the past 3 years. Their diabetes management products and pain relief medications are top-notch. What impresses me most is their logistics - we've never missed a single order deadline, even during the pandemic. Their technical support team is incredibly knowledgeable." },
    { initials: "AK", name: "Dr. Arjun Krishnan", role: "Chief Scientific Officer, BioResearch India", stars: 5, color: "from-purple-500 to-purple-600", borderColor: "border-purple-200 dark:border-purple-500", text: "As a clinical research organization in Bangalore, we've been sourcing investigational drugs from Nexlife for our Phase II and III trials. Their GMP compliance and documentation are impeccable. The team understands regulatory requirements perfectly and has helped us navigate complex approval processes. Their products meet international standards consistently." },
    { initials: "MV", name: "Meera Venkatesh", role: "Head of Procurement, Chennai Healthcare Network", stars: 4, color: "from-orange-500 to-orange-600", borderColor: "border-orange-200 dark:border-orange-500", text: "I manage procurement for a network of 8 hospitals in Chennai. Nexlife's oncology medications and critical care drugs have been lifesavers. Their cold chain management is exceptional, and they've never compromised on temperature-sensitive products. The only minor issue is sometimes longer lead times for specialty drugs, but quality is never compromised." },
    { initials: "SJ", name: "Dr. Sunita Joseph", role: "Medical Director, Rural Health Mission Kerala", stars: 5, color: "from-teal-500 to-teal-600", borderColor: "border-teal-200 dark:border-teal-500", text: "Our rural healthcare centers in Kerala have been sourcing medicines from Nexlife for the past 5 years. Their generic medications have made quality healthcare affordable for our patients. The team understands the challenges of rural healthcare and has customized solutions for us. Their emergency supply system has saved countless lives during natural disasters." },
    { initials: "AA", name: "Dr. Ahmed Al-Rashid", role: "Chief Medical Officer, Emirates Medical Center", stars: 5, color: "from-pink-500 to-pink-600", borderColor: "border-pink-200 dark:border-pink-500", text: "I've been importing Nexlife's products to our hospitals in Dubai for 6 years now. Their international compliance and export documentation are flawless. The products consistently pass our stringent quality checks, and their after-sales support is exceptional. They've helped us expand our formulary with innovative products that weren't available locally." },
  ];

  const stats = [
    { icon: Globe, end: 50, suffix: "+", label: "Countries Served", sub: "Global Reach", accent: "text-sky-400", accentBg: "bg-sky-500/15" },
    { icon: Users, end: 1000, suffix: "+", label: "Healthcare Partners", sub: "Trusted Worldwide", accent: "text-emerald-400", accentBg: "bg-emerald-500/15" },
    { icon: Award, end: 15, suffix: "+", label: "Years Experience", sub: "Proven Excellence", accent: "text-amber-400", accentBg: "bg-amber-500/15" },
    { icon: Shield, end: 99.9, suffix: "%", label: "Quality Assurance", sub: "Uncompromising", accent: "text-violet-400", accentBg: "bg-violet-500/15", decimals: 1 },
  ];

  const accentMap = {
    blue: { card: "hover:border-blue-300 dark:hover:border-blue-400", dot: "bg-blue-400", hover: "group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400", title: "group-hover:text-blue-600 dark:group-hover:text-blue-400" },
    green: { card: "hover:border-green-300 dark:hover:border-green-400", dot: "bg-green-400", hover: "group-hover/item:text-green-600 dark:group-hover/item:text-green-400", title: "group-hover:text-green-600 dark:group-hover:text-green-400" },
    purple: { card: "hover:border-purple-300 dark:hover:border-purple-400", dot: "bg-purple-400", hover: "group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400", title: "group-hover:text-purple-600 dark:group-hover:text-purple-400" },
    orange: { card: "hover:border-orange-300 dark:hover:border-orange-400", dot: "bg-orange-400", hover: "group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400", title: "group-hover:text-orange-600 dark:group-hover:text-orange-400" },
  };

  /* ─────────────────────────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen w-full overflow-x-hidden">

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section
        className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden -mt-8"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/30 to-blue-100/40 dark:from-gray-900/50 dark:via-gray-800/45 dark:to-gray-900/50" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* ── Left: text ── */}
            <div className="bg-white/85 dark:bg-gray-900/85 rounded-3xl p-6 md:p-10 shadow-2xl border border-white/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <img src={logoImage} alt="Nexlife Logo" className="w-7 h-7" loading="eager" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                  Nexlife International
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                Find The Solution For Your{" "}
                <span className="text-blue-600 dark:text-blue-400">Health</span>{" "}
                Here
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                At Nexlife International, we are committed to providing
                high-quality pharmaceutical solutions that improve lives
                worldwide. Our comprehensive range of products and services
                ensures healthcare providers have access to the best solutions
                for their patients.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-50 hover:shadow-lg transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Get Started</span>
                </Link>
                <DownloadButton onClick={handleDownload}>
                  Product Catalogue
                </DownloadButton>
              </div>
            </div>

            {/* ── Right: carousel ── */}
            <div className="relative w-full aspect-[4/3] md:h-96 rounded-2xl overflow-hidden border-2 border-black shadow-xl">
              {/* Slide track for infinite loop */}
              <div
                ref={carouselRef}
                className={`flex h-full ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
                style={{ transform: `translateX(-${currentSlide * 100}%)`, willChange: "transform" }}
                onTransitionEnd={handleTransitionEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {extendedSlides.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-full h-full">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading={i <= 1 ? "eager" : "lazy"}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`w-3 h-3 rounded-full border border-white/60 transition-all duration-300 ${
                      i === realSlideIndex ? "bg-white scale-125" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 z-10">
                <div
                  className="h-full bg-white/80 transition-all"
                  style={{
                    width: `${((realSlideIndex + 1) / heroImages.length) * 100}%`,
                    transition: isTransitioning ? "width 0.7s ease" : "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PHARMA CATEGORIES ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Top gradient bar */}
        <div className="max-w-7xl mx-auto">
          <div className="h-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pharmaCategories.map((cat, i) => {
              const a = accentMap[cat.accent];
              return (
                <FadeInCard key={cat.name} delay={i * 100}>
                  <div
                    className={`group h-full bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 ${a.card}`}
                  >
                    <div className="w-12 h-12 mb-3">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" loading="lazy" />
                    </div>
                    <h3 className={`text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 ${a.title}`}>
                      {cat.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                      {cat.desc}
                    </p>
                    <ul className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                      {cat.features.map((f) => (
                        <li key={f} className="flex items-center group/item">
                          <span className={`w-1.5 h-1.5 ${a.dot} rounded-full mr-2 flex-shrink-0`} />
                          <span className={`transition-colors duration-200 ${a.hover}`}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeInCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ OUR PRODUCTS ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Our Products"
            subtitle="Discover our comprehensive range of high-quality pharmaceutical products, manufactured with precision and delivered with excellence to healthcare providers worldwide."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((product, i) => (
              <FadeInCard key={product.name} delay={i * 80}>
                <div className="group h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className={`absolute top-3 left-3 ${product.tagColor} text-white px-2.5 py-1 rounded-full text-xs font-medium`}>
                      {product.tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {product.desc}
                    </p>
                  </div>
                </div>
              </FadeInCard>
            ))}
          </div>

          {/* Product Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowRight className="w-5 h-5" />
              Product Catalogue
            </Link>
            <Link
              to="/product-gallery"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowRight className="w-5 h-5" />
              Product Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY CHOOSE US ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Why Choose Us?"
            subtitle="We are committed to delivering excellence in every aspect of our pharmaceutical services."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {whyChooseUs.map((feature, i) => (
              <FadeInCard key={feature.title} delay={i * 120}>
                <div className="group h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6">
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FadeInCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ NEXLIFE STANDS FOR ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="NEXLIFE INTERNATIONAL STANDS FOR"
            subtitle="The four pillars that define our company's foundation and drive our success."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {companyPillars.map((pillar, i) => (
              <FadeInCard key={pillar.title} delay={i * 100}>
                <div className="group h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 p-5 md:p-6 text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4">
                    <img src={pillar.image} alt={pillar.title} className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </FadeInCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MISSION / VISION / GOAL ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Our Core Values"
            subtitle="Understanding our mission, vision, and goals helps you know what drives us forward."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {companyInfo.map((info, i) => (
              <FadeInCard key={info.title} delay={i * 120}>
                <div className="group h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-500 overflow-hidden">
                  <div className="p-8">
                    <div className="w-14 h-14 mb-5">
                      <img src={info.image} alt={info.title} className="w-full h-full object-contain" loading="lazy" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {info.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {info.description}
                    </p>
                  </div>
                </div>
              </FadeInCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ OFFICE & FACILITIES ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Our Office & Facilities"
            subtitle="Take a virtual tour of our modern office spaces and world-class facilities."
          />

          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Infinite loop slide track */}
            <div
              className={`flex ${officeTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
              style={{ transform: `translateX(-${officeSlide * 100}%)`, willChange: "transform" }}
              onTransitionEnd={handleOfficeTransitionEnd}
              onTouchStart={handleOfficeTouchStart}
              onTouchMove={handleOfficeTouchMove}
              onTouchEnd={handleOfficeTouchEnd}
            >
              {extendedOffice.map((img, i) => (
                <div key={i} className="flex-shrink-0 w-full">
                  <div className="aspect-[16/9] sm:aspect-[2/1] md:aspect-[5/2]">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading={i <= 1 ? "eager" : "lazy"}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Caption overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6">
              <p className="text-white font-medium text-sm sm:text-base">
                {officeImages[realOfficeIndex]?.alt}
              </p>
            </div>

            {/* Progress dots */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex gap-1.5 z-10">
              {officeImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setOfficeTransitioning(true); setOfficeSlide(i + 1); startOfficeAutoSlide(); }}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === realOfficeIndex ? "bg-white w-6" : "bg-white/50 w-2"
                  }`}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20 z-10">
              <div
                className="h-full bg-white/70"
                style={{
                  width: `${((realOfficeIndex + 1) / officeImages.length) * 100}%`,
                  transition: officeTransitioning ? "width 0.7s ease" : "none",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CUSTOMER REVIEWS ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="What Our Customers Say"
            subtitle="Trusted by healthcare professionals worldwide. Read authentic reviews from our satisfied customers."
          />

          {/* Carousel Container */}
          <div className="relative">
            {/* Prev Button */}
            <button
              onClick={prevReview}
              aria-label="Previous reviews"
              className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-2 border-gray-200 dark:border-gray-600"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Reviews Track */}
            <div
              className="overflow-hidden mx-6 md:mx-10"
              onTouchStart={handleReviewTouchStart}
              onTouchMove={handleReviewTouchMove}
              onTouchEnd={handleReviewTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${reviewIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {reviews.map((review, i) => (
                  <div
                    key={review.name}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <div className={`h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${review.borderColor} p-6`}>
                      <StarRating count={review.stars} />
                      <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic text-sm">
                        "{review.text}"
                      </p>
                      <div className="flex items-center">
                        <div className={`w-11 h-11 bg-gradient-to-r ${review.color} rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0`}>
                          {review.initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {review.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {review.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextReview}
              aria-label="Next reviews"
              className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-2 border-gray-200 dark:border-gray-600"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxReviewIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setReviewIndex(i); startReviewAutoSlide(); }}
                aria-label={`Go to review set ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === reviewIndex
                    ? "bg-blue-600 dark:bg-blue-400 scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-500 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <CTAFadeIn>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
              Ready to Partner With Us?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of healthcare providers worldwide who trust Nexlife
              International for their pharmaceutical needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started Today
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Our Products
              </Link>
            </div>
          </CTAFadeIn>
        </div>
      </section>

      {/* ═══════════════ GLOBAL STATS ═══════════════ */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
              Our Global Impact
            </h2>
            <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto">
              Numbers that tell the story of our commitment to global healthcare
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <FadeInCard key={stat.label} delay={i * 100}>
                  <div className="relative rounded-2xl p-5 md:p-7 text-center bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 transition-colors duration-300 group">
                    {/* Icon */}
                    <div className="flex justify-center mb-3 md:mb-4">
                      <div className={`w-10 h-10 md:w-11 md:h-11 ${stat.accentBg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 md:w-5.5 md:h-5.5 ${stat.accent}`} />
                      </div>
                    </div>
                    {/* Number */}
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 md:mb-2 tabular-nums">
                      <AnimatedCounter end={stat.end} suffix={stat.suffix} decimals={stat.decimals || 0} />
                    </div>
                    <div className="text-gray-200 font-medium text-sm md:text-base">
                      {stat.label}
                    </div>
                    <div className="text-gray-500 text-xs md:text-sm mt-0.5">
                      {stat.sub}
                    </div>
                  </div>
                </FadeInCard>
              );
            })}
          </div>

          <p className="text-center text-gray-500 text-sm mt-8 md:mt-12 max-w-xl mx-auto">
            Join thousands of healthcare professionals who trust Nexlife
            International for their pharmaceutical needs
          </p>
        </div>
      </section>

      {/* ═══════════════ CERTIFICATIONS ═══════════════ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Our Certifications & Standards"
            subtitle="Nexlife International maintains the highest standards of quality, safety, and compliance through internationally recognized certifications and regulatory approvals."
          />

          <div className="flex justify-center">
            <img
              src={certificationImage}
              alt="Certifications and Standards"
              className="max-w-full h-auto max-h-80 md:max-h-96 object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ DEBUG (dev only) ═══════════════ */}
      <DebugInfo />

      {/* ═══════════════ FLOATING CONTACT BUTTONS ═══════════════ */}
      <div
        className={`fixed right-2 md:right-4 z-50 transition-[bottom,opacity] duration-300 ${
          isNearFooter
            ? "bottom-24 md:bottom-28 opacity-80"
            : "bottom-4 md:bottom-6 opacity-100"
        }`}
      >
        {/* Expanded options */}
        <div
          className={`mb-3 space-y-2.5 transition-[opacity,transform] duration-300 ${
            isFloatingOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <a
            href="https://wa.me/919664843790"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">WhatsApp</span>
          </a>
          <a
            href="tel:+919664843790"
            className="flex items-center gap-2.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            <img src={callNowImage} alt="Call" className="w-5 h-5" />
            <span className="text-sm font-medium">Call Now</span>
          </a>
          <a
            href="mailto:info@nexlifeinternational.com"
            className="flex items-center gap-2.5 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm font-medium">Email Us</span>
          </a>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsFloatingOpen((v) => !v)}
          aria-label="Toggle contact options"
          className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-[box-shadow,transform,background-color] duration-300 hover:scale-105 flex items-center justify-center"
        >
          {isFloatingOpen ? (
            <X className="w-6 h-6 text-gray-900 dark:text-white" />
          ) : (
            <img src={callNowImage} alt="Contact Us" className="w-14 h-14 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────  FadeInCard  ───────────────────────── */
function FadeInCard({ children, delay = 0 }) {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-600 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────  CTAFadeIn  ───────────────────────── */
function CTAFadeIn({ children }) {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

export default HomeNew;
