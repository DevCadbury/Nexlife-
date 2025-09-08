import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Download } from "lucide-react";
import { Link } from "react-router-dom";

// No images used on this page per request

// No styled card wrapper needed since images are removed

const PlateletAggregationProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Platelet Aggregation products data
  const plateletProducts = [
    {
      id: 1,
      name: "Clopidogrel Tablet",
      description:
        "Each Film Coated Tablet Contains: Clopidogrel Bisulfate USP Eq. to Clopidogrel____75 mg Colour : Red Oxide of Iron & Titanium Dioxide BP",
      type: "Film Coated Tablet",
      packaging: "Blister",
    },
  ];

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return plateletProducts;

    const searchLower = searchTerm.toLowerCase();
    return plateletProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.type.toLowerCase().includes(searchLower) ||
        product.packaging.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

  const displayProducts = searchTerm.trim() ? searchResults : plateletProducts;

  const hasSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return true;
    return searchResults.length > 0;
  }, [searchTerm, searchResults]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
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
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
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
                Platelet Aggregation Products
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Antiplatelet medications for cardiovascular protection.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          {/* Search Bar */}
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
                  if (e.key === "Escape") setSearchTerm("");
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
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <h2 className="text-2xl font-bold">
                      Platelet Aggregation Products Catalog
                    </h2>
                    <p className="text-blue-100 mt-2">
                      Complete list of our antiplatelet medications
                    </p>
                  </div>

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
                        {displayProducts.map((product) => (
                          <motion.tr
                            key={product.id}
                            variants={itemVariants}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 border-b border-gray-300 dark:border-gray-600 last:border-b-0"
                          >
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0">
                              <div className="text-sm font-bold text-gray-900 dark:text-white text-center">
                                {product.id}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {product.name}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 border-r border-gray-300 dark:border-gray-600 last:border-r-0">
                              <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                                {product.description}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {product.type}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0">
                              <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
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

          {/* Product Images Gallery removed per request */}

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
                Get detailed information about all our antiplatelet products,
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

      <div className="h-20 bg-transparent"></div>
    </div>
  );
};

export default PlateletAggregationProducts;
