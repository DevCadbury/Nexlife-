import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pill, Download, Search } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Styled Components for Card Design
const StyledCardWrapper = styled.div`
  .card {
    width: 100%;
    max-width: 400px;
    height: auto;
    min-height: 300px;
    background-image: linear-gradient(163deg, #10b981 0%, #059669 100%);
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

const AyurvedicProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Ayurvedic products (brand, generic, packing)
  const ayurvedicProducts = [
    {
      id: 1,
      brand: "MEDIMOVE",
      name: "Ayurvedic Pain Relief Gel",
      packing: "30 g",
    },
    {
      id: 2,
      brand: "MEDIMOVE",
      name: "Ayurvedic Pain Relief Balm",
      packing: "10 g,  25 g",
    },
    {
      id: 3,
      brand: "MEDIMOVE",
      name: "Ayurvedic Pain Relief Roll On",
      packing: "50 ML",
    },
    {
      id: 4,
      brand: "TOP ACTION",
      name: "Ayurvedic Itch Care Cream",
      packing: "25 G",
    },
    {
      id: 5,
      brand: "TOP ACTION",
      name: "Ayurvedic Vaporizing Rub",
      packing: "10 G, 25 G",
    },
    {
      id: 6,
      brand: "TOP ACTION",
      name: "Nasal Inhaler",
      packing: "0.5 ML,1 ML",
    },
    {
      id: 7,
      brand: "TOP ACTION",
      name: "Ayurvedic Heel Care Cream",
      packing: "25 G",
    },
    {
      id: 8,
      brand: "TOP ACTION HAMORID",
      name: "Ayurvedic Piles Care Cream",
      packing: "30 G",
    },
    {
      id: 9,
      brand: "MEDIMOVE RELIEF",
      name: "Ayurvedic Pain Relief Spray",
      packing: "75 ML/150 ML",
    },
    {
      id: 10,
      brand: "HAIR CARE",
      name: "Almond, Jasmine, Amla, Coconut Oil",
      packing: "100/200/500 ML",
    },
    {
      id: 11,
      brand: "TURMERIC CREAM",
      name: "Turmeric Skin Cream",
      packing: "30 G",
    },
    {
      id: 12,
      brand: "BORO PERFECT",
      name: "Skin Softening Cream",
      packing: "25 G",
    },
    {
      id: 13,
      brand: "SPOT CLEAR",
      name: "Herbal Pimple Care Cream",
      packing: "25 G",
    },
    {
      id: 14,
      brand: "SGO GO CARE SODA",
      name: "Fruit Soda same like Eno",
      packing: "5 G * 30 PC / BOX",
    },
    {
      id: 15,
      brand: "TEETHVED",
      name: "Ayurvedic Toothpaste",
      packing: "100 G, 200 G",
    },
    {
      id: 16,
      brand: "VET PAIN RELIEF",
      name: "Ayurvedic Pain relief Spray for Animal",
      packing: "75 ML / 150 ML",
    },
    {
      id: 17,
      brand: "INSECTAWAY",
      name: "Natural Insect Repellent SprayNatural Anti Tick Spray",
      packing: "100 ML",
    },
    {
      id: 18,
      brand: "ANTI TICK Spray",
      name: "Natural Anti Tick Spray",
      packing: "100 ML",
    },
    { id: 19, brand: "WARRIOR", name: "Disinfectant Spray", packing: "350 ML" },
  ];

  // Memoized search results to prevent unnecessary re-renders
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return ayurvedicProducts;

    const searchLower = searchTerm.toLowerCase();
    return ayurvedicProducts.filter((product) => {
      return (
        product.brand.toLowerCase().includes(searchLower) ||
        product.name.toLowerCase().includes(searchLower) ||
        product.packing.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

  // Show filtered products or all products if no search
  const displayProducts = searchTerm.trim() ? searchResults : ayurvedicProducts;

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
                Ayurvedic Products
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Explore our range of ayurvedic wellness products.
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
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-800 dark:border-gray-600 overflow-hidden"
                >
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <h2 className="text-2xl font-bold">
                      Ayurvedic Products Catalog
                    </h2>
                    <p className="text-blue-100 mt-2">
                      Complete list of our ayurvedic products
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
                            Brand Name
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            Generic Name
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b-2 border-r border-gray-300 dark:border-gray-500 last:border-r-0">
                            Packing
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
                                {product.brand}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200">
                              <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                                {product.name}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200">
                              <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                                {product.packing}
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

          {/* Product Images Gallery intentionally removed per request */}

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
                Download Complete Product Catalog
              </h3>
              <p className="text-blue-100 mb-6">
                Get detailed information about all our ayurvedic products,
                specifications, and pricing.
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

export default AyurvedicProducts;
