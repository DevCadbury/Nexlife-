import React, { useState, useMemo } from "react";
import { useDesktopOnly } from "../hooks/useDesktopOnly";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pill, Download, Search } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import cetirizineImg from "../assets/images/anti-allergic/CETRIZINEANTI-ALLERGIC.png";
import cetirizineImg2 from "../assets/images/anti-allergic/CETRIZINEANTI-ALLERGIC5.png";

// Styled Components for Card Design
const StyledCardWrapper = styled.div`
  .card {
    width: 100%;
    max-width: 400px;
    height: auto;
    min-height: 300px;
    background-image: linear-gradient(163deg, #f59e0b 0%, #d97706 100%);
    border-radius: 20px;
    transition: all 0.3s;
    padding: 3px;
  }

  .card2 {
    width: 100%;
    height: 100%;
    min-height: 294px;
    background-color: transparent;
    border-radius: 17px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 0;
  }

  .card2:hover {
    transform: scale(0.98);
    border-radius: 20px;
  }

  .card:hover {
    box-shadow: 0px 0px 30px 1px rgba(16, 185, 129, 0.3);
  }

  .card img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  .card:hover img {
    transform: scale(1.05);
  }
`;

const AntiAllergicProducts = () => {
  // Force desktop view on all devices
  useDesktopOnly();

  const [searchTerm, setSearchTerm] = useState("");

  // Anti Allergic products data
  const antiAllergicProducts = [
    {
      id: 1,
      name: "Cetirizine Dihydrochloride Tablet",
      description:
        "Each Film Coated Tablet Contains : Cetirizine Dihydrochloride BP___5mg/10mg Colour : Titanium Dioxide BP",
      type: "Film coated Tablet",
      packaging: "Blister",
      image: cetirizineImg,
    },
    {
      id: 2,
      name: "Cetirizine Hydrochloride, Paracetamol & Phenylpropanolamine Hydrochloride",
      description:
        "Each Uncoated Tablet Contains : Paracetamol BP___500mg Cetirizine Hydrochloride BP___5mg Phenylpropanolamine Hydrochloride BP___10mg",
      type: "Uncoated Tablet",
      packaging: "Blister",
      image: cetirizineImg2,
    },
    {
      id: 3,
      name: "Chlorpheniramine Maleate Tablet",
      description:
        "Each Uncoated Tablet Contains: Chlorpheniramine Maleate BP___4mg",
      type: "Uncoated Tablet",
      packaging: "Blister",
      image: cetirizineImg,
    },
    {
      id: 4,
      name: "Fexofenadine Tablet",
      description:
        "Each Film Coated Tablet Contains: Fexofenadine Hydrochloride___120mg Colour : Titanium Dioxide BP",
      type: "Film coated Tablet",
      packaging: "Blister",
      image: cetirizineImg2,
    },
    {
      id: 5,
      name: "Levocetirizine Tablet",
      description:
        "EachFilm Coated Tablet Contains : Levocetirizine Dihydrochloride__5mg Colour : Titanium Dioxide BP",
      type: "Film coated Tablet",
      packaging: "Blister",
      image: cetirizineImg,
    },
    {
      id: 6,
      name: "Loratadine Tablet",
      description:
        "Each Uncoated Tablet Contains: Loratadine USP___10mg Colour : Erythrosine",
      type: "Uncoated Tablet",
      packaging: "Blister",
      image: cetirizineImg2,
    },
    {
      id: 7,
      name: "Paracetamol, Chlorpheniramine Maleate, Phenylpropanolamine Hydrochloride & Caffeine Tablet",
      description:
        "Each Uncoated Tablet Contains : Paracetamol   BP___500mg Caffeine(Anhydrous)  BP___30mg Chlorpheniramine Maleate BP___2mg Phenylpropanolamine Hydrochloride BP___10mg",
      type: "Uncoated Tablet",
      packaging: "Blister",
      image: cetirizineImg,
    },
  ];

  // Memoized search results to prevent unnecessary re-renders
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return antiAllergicProducts;

    const searchLower = searchTerm.toLowerCase();
    return antiAllergicProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.type.toLowerCase().includes(searchLower) ||
        product.packaging.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

  // Show filtered products or all products if no search
  const displayProducts = searchTerm.trim()
    ? searchResults
    : antiAllergicProducts;

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
                Anti Allergic Products
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Discover our comprehensive range of anti-allergic medications
                for effective allergy relief and management.
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
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-amber-200 dark:border-amber-600 overflow-hidden"
                >
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                    <h2 className="text-2xl font-bold">
                      Anti Allergic Products Catalog
                    </h2>
                    <p className="text-amber-100 mt-2">
                      Complete list of our anti-allergic medications
                    </p>
                  </div>

                  {/* Table Content */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-2 border-gray-300 dark:border-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            SR. NO
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            Generic Name
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            Label Claim
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            Dosage Form
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            Primary Packing
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800">
                        {displayProducts.map((product, index) => (
                          <motion.tr
                            key={product.id}
                            variants={itemVariants}
                            className="hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 border-b border-gray-300 dark:border-gray-600 last:border-b-0"
                          >
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors duration-200">
                              <div className="text-sm font-bold text-gray-900 dark:text-white text-center">
                                {product.id}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors duration-200">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {product.name}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors duration-200">
                              <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                                {product.description}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors duration-200">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                {product.type}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors duration-200">
                              <span className="text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-1 rounded">
                                {product.packaging}
                              </span>
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
                  className="inline-flex items-center space-x-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors duration-200"
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
            <div className="mt-3 h-1 w-24 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full"></div>
          </motion.div>

          {/* Product Images Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-12 mb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto justify-items-center">
              {antiAllergicProducts.slice(0, 2).map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: product.id * 0.1 }}
                >
                  <StyledCardWrapper>
                    <div className="card">
                      <div className="card2">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </StyledCardWrapper>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Download Catalog CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Download Complete Product Catalog
              </h3>
              <p className="text-amber-100 mb-6">
                Get detailed information about all our anti-allergic products,
                specifications, and pricing.
              </p>
              <a
                href="https://drive.google.com/file/d/1Ct4xhTjZbbe-XoAjZZor7N74_YwWZPYC/view?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-3 bg-white text-amber-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
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

export default AntiAllergicProducts;
