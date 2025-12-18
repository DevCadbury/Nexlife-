import React, { useState, useMemo } from "react";
import { useDesktopOnly } from "../../hooks/useDesktopOnly";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pill, Download, Search } from "lucide-react";
import { Link } from "react-router-dom";

const SurgicalProducts = () => {
  // Force desktop view on all devices
  useDesktopOnly();

  const [searchTerm, setSearchTerm] = useState("");

  // Surgical products data
  const surgicalProducts = [
    {
      id: 1,
      brandName: "MENDWELL",
      genericName: "Belladonna Plaster",
      packing: "10 CM X 16 CM\n11 CM X 17 CM",
      packingBox: "100 Pcs/Box\n100 Pcs/Box",
    },
    {
      id: 2,
      brandName: "MENDWELL",
      genericName: "Capsicum Plaster",
      packing: "11 CM X 17 CM\n12 CM X 18 CM",
      packingBox: "100 Pcs/Box\n100 Pcs/Box",
    },
    {
      id: 3,
      brandName: "MENDWELL",
      genericName: "Corn Caps",
      packing: "4 Pcs /Catch Cover",
      packingBox: "50 Pcs/Box",
    },
    {
      id: 4,
      brandName: "MENDWELL",
      genericName: "Medicated Dressing Bandage",
      packing: "Round, Square, Square",
      packingBox: "100 Pcs/Box",
    },
    {
      id: 5,
      brandName: "MENDWELL",
      genericName: "Adhesive Tape USP or Zinc Oxide Plaster",
      packing:
        "1.25 CM X 1 M\n2.50 CM X 1 M\n1.25 CM X 5 M\n2.50 CM X 5 M\n5.00 CM X 5 M\n7.50 CM X 5 M\n10.0 CM X 5 M",
      packingBox:
        "60 Spools / Box\n40 Spools / Box\n50 Spools / Box\n30 Spools / Box\n20 Spools / Box\n10 Spools / Box\n10 Spools / Box",
    },
    {
      id: 6,
      brandName: "MENDWELL",
      genericName: "Adhesive Tape USP or Zinc Oxide Plaster HOSPITAL PACK",
      packing:
        "2.50 CM X 8 M\n5.00 CM X 8 M\n7.50 CM X 8 M\n10.0 CM X 8 M\n2.50 CM X 9 M\n5.00 CM X 9 M\n7.50 CM X 9 M\n10.0 CM X 9 M\n2.50 CM X 10 M\n5.00 CM X 10 M\n7.50 CM X 10 M\n10.0 CM X 10 M",
      packingBox:
        "12 Spools / Box\n6 Spools / Box\n4 Spools / Box\n3 Spools / Box\n12 Spools / Box\n6 Spools / Box\n4 Spools / Box\n3 Spools / Box\n12 Spools / Box\n6 Spools / Box\n4 Spools / Box\n3 Spools / Box",
    },
    {
      id: 7,
      brandName: "MENDWELL",
      genericName: "Microporous Non-Woven Tape",
      packing:
        "1.25 CM X 9.1 M\n2.50 CM X 9.1 M\n5.00 CM X 9.1 M\n7.50 CM X 9.1 M\n1.25 CM X 5 M\n2.50 CM X 5 M\n5.00 CM X 5 M\n7.50 CM X 5 M",
      packingBox:
        "24 Pcs / Box\n12 Pcs / Box\n6 Pcs / Box\n4 Pcs / Box\n24 Pcs / Box\n12 Pcs / Box\n6 Pcs / Box\n4 Pcs / Box",
    },
    {
      id: 8,
      brandName: "MENDWELL",
      genericName: "Cotton Crepe Bandage B.P",
      packing: "6.00 CM X 4 M\n8.00 CM X 4 M\n10.0 CM X 4 M\n15.0 CM X 4 M",
      packingBox: "PVC Jar\nPVC Jar\nPVC Jar\nPVC Jar",
    },
    {
      id: 9,
      brandName: "MENDWELL",
      genericName: "Adhesive Non-Woven Tape",
      packing: "10.0 CM X 10 M",
      packingBox: "6 Pcs /Box",
    },
    {
      id: 10,
      brandName: "MENDWELL",
      genericName: "Perforated Transparent Surgical Tape",
      packing:
        "1.25 CM X 9.1 M\n2.50 CM X 9.1 M\n5.00 CM X 9.1 M\n7.50 CM X 9.1 M",
      packingBox: "24 Pcs / Box\n12 Pcs / Box\n6 Pcs / Box\n4 Pcs / Box",
    },
    {
      id: 11,
      brandName: "MENDWELL",
      genericName: "Kinesiology Tape",
      packing: "5 CM X 5 M",
      packingBox: "12 Pcs / Box",
    },
    {
      id: 12,
      brandName: "MENDWELL",
      genericName: "Plaster of Paris BP",
      packing:
        "5.00 CM X 2.7 M\n7.50 CM X 2.7 M\n10.0 CM X 2.7 M\n15.0 CM X 2.7 M\n20.0 CM X 2.7 M",
      packingBox: "1 Pcs\n1 Pcs\n1 Pcs\n1 Pcs\n1 Pcs",
    },
    {
      id: 13,
      brandName: "MENDWELL",
      genericName: "Cast Padding Roll",
      packing: "10.0 CM X 3.0 M\n15.0 CM X 3.0 M",
      packingBox: "1 Pcs\n1 Pcs",
    },
    {
      id: 14,
      brandName: "MENDWELL",
      genericName: "Gamjee Roll",
      packing: "10.0 CM X 3.0 M\n15.0 CM X 3.0 M",
      packingBox: "1 Pcs\n1 Pcs",
    },
    {
      id: 15,
      brandName: "LIFE-COAT",
      genericName: "Absorbent Cotton Wool",
      packing: "Zig Zag Cotton IP\n20 G, 50 G, 100 G\n200 G & 500 G",
      packingBox: "Various sizes available",
    },
    {
      id: 16,
      brandName: "TOPMOST",
      genericName: "Bandage- Handloom Cloth Roll",
      packing: "5 CM X 8 M\n7.5 CM X 8 M\n10 CM X 8 M\n15 CM X 8 M",
      packingBox: "1 Pcs\n1 Pcs\n1 Pcs\n1 Pcs",
    },
    {
      id: 17,
      brandName: "LIFE-COAT",
      genericName: "Gauze Cloth",
      packing: "45 CM X 16 M\n90 CM X 16 M",
      packingBox: "1 Pcs\n1 Pcs",
    },
    {
      id: 18,
      brandName: "LIFE-COAT",
      genericName: "Hot Water Bag",
      packing: "Rubber",
      packingBox: "1 Pcs",
    },
    {
      id: 19,
      brandName: "LIFE-COAT",
      genericName: "Electric Hot Water Bag",
      packing: "Electric",
      packingBox: "1 Pcs",
    },
    {
      id: 20,
      brandName: "MENDWELL",
      genericName: "IV Cannula Fixator",
      packing: "Elastic Adhesive",
      packingBox: "50 Pcs / Box",
    },
    {
      id: 21,
      brandName: "POVILITE",
      genericName: "Iodine Povidone Solution",
      packing: "5%, 7.5%, 10.0%",
      packingBox: "100, 200, 500,1000 , 2000 ml",
    },
    {
      id: 22,
      brandName: "POVILITE",
      genericName: "Iodine Povidone Cream",
      packing: "5%",
      packingBox: "15G, 30 G",
    },
    {
      id: 23,
      brandName: "CORE",
      genericName: "Male Condoms with Gloves",
      packing: "Dotted",
      packingBox: "3 Pcs / Box\n10 Pcs / Box",
    },
    {
      id: 24,
      brandName: "EUROLITE",
      genericName: "Dial Flow-Infusion Set",
      packing: "21 G Vein Needle",
      packingBox: "1 Pcs",
    },
    {
      id: 25,
      brandName: "EUROLITE",
      genericName: "Infusion Set Vented",
      packing: "21 G Vein Needle",
      packingBox: "1 Pcs",
    },
    {
      id: 26,
      brandName: "EUROLITE",
      genericName: "Infusion Set Delux",
      packing: "21 G Vein Needle",
      packingBox: "1 Pcs",
    },
    {
      id: 27,
      brandName: "EUROLITE",
      genericName: "Infusion Set Micro Drip",
      packing: "23 G Vein Needle",
      packingBox: "1 Pcs",
    },
    {
      id: 28,
      brandName: "EUROLITE",
      genericName: "Blood Administration Set",
      packing: "18 G Vein Needle",
      packingBox: "1 Pcs",
    },
    {
      id: 29,
      brandName: "EUROLITE",
      genericName: "Measured Volume Set",
      packing: "IV 100/150 ml Dual Flow Control",
      packingBox: "1 Pcs",
    },
    {
      id: 31,
      brandName: "EUROLITE",
      genericName: "I.V Cannula",
      packing: "With Injection Valve, PTFE Catheter, Luer Lock",
      packingBox: "1 Pcs",
    },
    {
      id: 32,
      brandName: "EUROLITE",
      genericName: "Urine Collection Bag",
      packing: "Double Seal PVC Material",
      packingBox: "2000 Ml",
    },
    {
      id: 33,
      brandName: "EUROLITE",
      genericName: "Urine Culture Bottle",
      packing: "EO Sterile",
      packingBox: "50 ml",
    },
    {
      id: 34,
      brandName: "EUROLITE",
      genericName: "Dial Flow Regulator with Extension Tube",
      packing: "1 to 250 ml/h (1 ml = 20 Drops)",
      packingBox: "1 Pcs",
    },
    {
      id: 35,
      brandName: "EUROLITE",
      genericName: "Surgical Latex Gloves",
      packing: "Made with Natural Latex",
      packingBox: "1 Pair In Paper Pouch",
    },
    {
      id: 36,
      brandName: "EUROLITE",
      genericName: "Examination Gloves",
      packing: "Made with Natural Latex or Plastic",
      packingBox: "100 Pcs / Box",
    },
    {
      id: 37,
      brandName: "EUROLITE",
      genericName: "Urethral Catheter",
      packing:
        "Made with Medical Grade PVC tube with radio-o-paque X-ray detectable Lines",
      packingBox: "1 Pcs",
    },
    {
      id: 38,
      brandName: "EUROLITE",
      genericName: "Male External Catheter",
      packing: "Condom Catheter",
      packingBox: "1 Pcs",
    },
    {
      id: 39,
      brandName: "EUROLITE",
      genericName: "Mucus Extractor",
      packing: "For New Born Babies",
      packingBox: "1 Pcs",
    },
    {
      id: 40,
      brandName: "EUROLITE",
      genericName: "Ryle's Tube",
      packing: "GIT Feeding",
      packingBox: "1 Pcs",
    },
    {
      id: 41,
      brandName: "EUROLITE",
      genericName: "Suction Catheter",
      packing: "Tracheobronchial Suction",
      packingBox: "1 Pcs",
    },
    {
      id: 42,
      brandName: "EUROLITE",
      genericName: "Disposable Syringes",
      packing: "3 Parts, Luer Mount Tips, Ribbon Packed",
      packingBox: "5 ml, 10 ml, 20 ml, 50 ml",
    },
    {
      id: 43,
      brandName: "EUROLITE",
      genericName: "3 Way Stop Cock With Extension Tube",
      packing: "Integrated IV extension",
      packingBox: "1 Pcs",
    },
    {
      id: 44,
      brandName: "EUROLITE",
      genericName: "Suction Catheter",
      packing: "Thump Control Connector",
      packingBox: "1 Pcs",
    },
    {
      id: 45,
      brandName: "EUROLITE",
      genericName: "Nebulizer Mask",
      packing: "Non Toxic Medical Grade",
      packingBox: "180 CM",
    },
    {
      id: 46,
      brandName: "EUROLITE",
      genericName: "Oxygen Mask",
      packing: "Non Toxic Medical Grade",
      packingBox: "1 Pcs",
    },
    {
      id: 47,
      brandName: "EUROLITE",
      genericName: "Twin Bore Oxygen Nasal Cannula",
      packing: "Star Lumen Main tube to avoid blockage",
      packingBox: "200 CM",
    },
    {
      id: 48,
      brandName: "EUROLITE",
      genericName: "Surgical 3 Ply Mask and N-95 Mask",
      packing: "Non-Woven Elastic",
      packingBox: "100 Pcs / Box",
    },
    {
      id: 49,
      brandName: "EUROLITE",
      genericName: "Surgeon Cap",
      packing: "Non-Woven",
      packingBox: "100 Pcs / Bag",
    },
    {
      id: 50,
      brandName: "EUROLITE",
      genericName: "PHACO Trolley Cover",
      packing: "EO-Sterile",
      packingBox: "100 CM X 100 CM",
    },
    {
      id: 51,
      brandName: "EUROLITE",
      genericName: "Shoe Cover or Knee Cover",
      packing: "Disposable Non-Woven Fabrics or Plastic",
      packingBox: "100 Pcs / Bag",
    },
    {
      id: 52,
      brandName: "EUROLITE",
      genericName: "HIV Protection Kit",
      packing: "Disposable Gown, Cap, Mask, Shoe Cover, Latex Gloves",
      packingBox: "100 Pcs / Bag",
    },
    {
      id: 53,
      brandName: "EUROLITE",
      genericName: "Disposable Surgical Gown",
      packing: "25 GSM or 40 GSM",
      packingBox: "100 Pcs / Bag",
    },
    {
      id: 54,
      brandName: "EUROLITE",
      genericName: "OT Surgical Gown",
      packing: "43 GSM",
      packingBox: "100 Pcs / Bag",
    },
    {
      id: 55,
      brandName: "EUROLITE",
      genericName: "Plain Drape",
      packing: "Disposable LDPE",
      packingBox: "1000 Pcs / Bag",
    },
    {
      id: 56,
      brandName: "EUROLITE",
      genericName: "Non-Woven Bed Sheet",
      packing: "Disposable",
      packingBox: "Loose",
    },
    {
      id: 57,
      brandName: "EUROLITE",
      genericName: "Bio Medical Waste Collection Bag",
      packing: "LDPE, HDPE",
      packingBox: "19 x 12 Inch\n24 X 27 Inch\n30 X 40 Inch",
    },
    {
      id: 58,
      brandName: "EUROLITE",
      genericName: "Eye Lance Tip",
      packing: "Blade for first sclerial Incision",
      packingBox: "15o St",
    },
    {
      id: 59,
      brandName: "EUROLITE",
      genericName: "Keratome Slit Knife (Pointed Tip)",
      packing: "Blade for Entry into anterior Chamber or phaco stab incision",
      packingBox: "45o St",
    },
    {
      id: 60,
      brandName: "EUROLITE",
      genericName: "Crescent Knives (Tunnel)",
      packing: "Blade for sclerial Tunnel Incision or groove in sclerial.",
      packingBox: "45o St",
    },
    {
      id: 61,
      brandName: "EUROLITE",
      genericName: "Enlarger Implant Blade (Blunt Tip)",
      packing: "Blade for Enlargement of Slit or IOL implant incision",
      packingBox: "45o St",
    },
    {
      id: 62,
      brandName: "EUROLITE",
      genericName: "MRV Needle Blade (Vetrio Retinal)",
      packing: "For Retinal Surgery",
      packingBox: "19, 20, 21 Gauge",
    },
    {
      id: 63,
      brandName: "EUROLITE",
      genericName: "Ophthalmic Kit",
      packing: "Phaco or Small Incision Surgery",
      packingBox: "1 Kit",
    },
    {
      id: 64,
      brandName: "DENGULITE Ig /IgM",
      genericName: "Dengue Ig / IgM Card",
      packing: "Lateral Flow Technology",
      packingBox: "10 Kit / Box",
    },
    {
      id: 65,
      brandName: "DENGULITE Ns",
      genericName: "Dengue Ns1 Card",
      packing: "Lateral Flow Technology",
      packingBox: "10 Kit / Box",
    },
    {
      id: 66,
      brandName: "DENGULITE COMBO",
      genericName: "Dengue Ig / IgM / Ns1 Combo",
      packing: "Lateral Flow Technology",
      packingBox: "10 Kit / Box",
    },
    {
      id: 67,
      brandName: "MALERIALITE",
      genericName: "Malaria PF / PV Antigen",
      packing: "Lateral Flow Technology",
      packingBox: "40 Kit / Box",
    },
    {
      id: 68,
      brandName: "HIV Kit",
      genericName: "HIV Rapid Test Kit",
      packing: "HIV Detection Test",
      packingBox: "50 Kit / Box",
    },
    {
      id: 69,
      brandName: "SYPHILIS KIT",
      genericName: "Syphilis Rapid Test Kit",
      packing: "Syphilis Detection Test",
      packingBox: "50 Kit / Box",
    },
    {
      id: 70,
      brandName: "PREGALITE",
      genericName: "Pregnancy Test Kit",
      packing: "Lateral Flow Technology",
      packingBox: "100 Kit / Box",
    },
    {
      id: 71,
      brandName: "LUVLIFE",
      genericName: "Premium Breast Pads",
      packing: "Lactating Mother Use",
      packingBox: "24 Pcs / Box",
    },
    {
      id: 72,
      brandName: "KID'S WELL",
      genericName: "Deluxe Premium Breast Pump",
      packing: "BPA Free, Non Toxic Food Grade",
      packingBox: "1 Pcs",
    },
    {
      id: 73,
      brandName: "SKINIC",
      genericName: "Refreshing Flavored Wipes",
      packing: "Rose, Lavender, Jasmine, Lemon, Mint Rose, Aloevera",
      packingBox: "25 Wipes",
    },
    {
      id: 74,
      brandName: "SKINIC",
      genericName: "Disinfectant Wipes",
      packing: "Surface Disinfectant",
      packingBox: "80 Wipes",
    },
    {
      id: 75,
      brandName: "SKINIC",
      genericName: "Baby Wet Wipes",
      packing: "Premium Baby Wipes",
      packingBox: "80 Wipes with Lid",
    },
    {
      id: 76,
      brandName: "SKINIC",
      genericName: "Bed Bath Wipes",
      packing: "Hospital Use for Patient Hygiene",
      packingBox: "10 Wipes",
    },
  ];

  // Memoized search results to prevent unnecessary re-renders
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return surgicalProducts;

    const searchLower = searchTerm.toLowerCase();
    return surgicalProducts.filter((product) => {
      return (
        product.brandName.toLowerCase().includes(searchLower) ||
        product.genericName.toLowerCase().includes(searchLower) ||
        product.packing.toLowerCase().includes(searchLower) ||
        product.packingBox.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

  // Show filtered products or all products if no search
  const displayProducts = searchTerm.trim() ? searchResults : surgicalProducts;

  // Check if search has results
  const hasSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return true;
    return searchResults.length > 0;
  }, [searchTerm, searchResults]);

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen pt-2" style={{ minWidth: "768px" }}>
      {/* Hero Section */}
      <section className="relative py-8 overflow-hidden">
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
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center mb-6">
                <Link
                  to="/products"
                  className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 mr-4"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Products</span>
                </Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Surgical Products
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Discover our comprehensive range of surgical instruments,
                medical devices, and healthcare products for professional
                medical use.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="max-w-md mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchTerm("");
                  }
                }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
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
                key={`products-${searchTerm}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-16"
              >
                {/* Products Table */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-blue-600 overflow-hidden"
                >
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <h2 className="text-2xl font-bold">
                      Surgical Products Catalog
                    </h2>
                    <p className="text-blue-100 mt-2">
                      Complete list of our surgical and medical devices
                    </p>
                  </div>

                  {/* Table Content */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-2 border-gray-300 dark:border-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            SR. NO
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            BRAND NAME
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            GENERIC NAME
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            PACKING
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            PACKING BOX
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800">
                        {displayProducts.map((product, index) => (
                          <motion.tr
                            key={product.id}
                            variants={itemVariants}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 border-b border-gray-300 dark:border-gray-600 last:border-b-0"
                          >
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200">
                              <div className="text-sm font-bold text-gray-900 dark:text-white text-center">
                                {product.id}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {product.brandName}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200">
                              <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                                {product.genericName}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200">
                              <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs whitespace-pre-line">
                                {product.packing}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200">
                              <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs whitespace-pre-line">
                                {product.packingBox}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
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
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  <span>Clear Search</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Section Header: Our Products */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">
              Our Products
            </h2>
            <div className="mt-3 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </motion.div>

          {/* Download Catalog CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Download Complete Surgical Products Catalog
              </h3>
              <p className="text-blue-100 mb-6">
                Get detailed information about all our surgical instruments,
                medical devices, and healthcare products with specifications and
                pricing.
              </p>
              <a
                href="https://drive.google.com/file/d/1Ct4xhTjZbbe-XoAjZZor7N74_YwWZPYC/view?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-3 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF Catalog</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Spacing for Desktop Layout */}
      <div className="h-20 bg-transparent"></div>
    </div>
  );
};

export default SurgicalProducts;
