import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Pill,
  FileText,
  Layers,
  BookOpen,
  Search,
  X,
  Tag,
  ShieldCheck,
  Filter,
  ChevronDown,
  Loader2,
  AlertCircle,
  ImageOff,
} from "lucide-react";
import SEOHead from "../components/SEOHead";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const ProductGallery = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = selectedCategory === "All" 
          ? `${API_URL}/products-gallery`
          : `${API_URL}/products-gallery/category/${selectedCategory}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle both array and object responses
        const productArray = Array.isArray(data) ? data : (data.items || []);
        
        // Only show visible products to public
        const visibleProducts = productArray.filter(product => product.visible !== false);
        setProducts(visibleProducts);
        
        // Extract unique categories
        const uniqueCategories = ["All", ...new Set(productArray.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.components?.some((comp) => comp.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <>
      <SEOHead
        title="Product Gallery - Nexlife International"
        description="Explore our comprehensive pharmaceutical product gallery with detailed information about medicines, compositions, uses, and packing."
        keywords="pharmaceutical products, medicine gallery, drug information, tablet details, capsule information"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Product Gallery
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Comprehensive information about our pharmaceutical products with detailed specifications
            </p>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, brand, or components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-lg text-slate-600 dark:text-slate-400">Loading products...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">
                  Failed to Load Products
                </h3>
                <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6"
            >
              <p className="text-slate-600 dark:text-slate-400">
                Showing <span className="font-bold text-blue-600">{filteredProducts.length}</span> products
              </p>
            </motion.div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700">
                    {/* Card Header with Image or Gradient */}
                    <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                      {product.image?.url ? (
                        <>
                          <img
                            src={product.image.url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                            <Package className="w-24 h-24 text-white/30 relative z-10" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-24 h-24 text-white/30" />
                          </div>
                        </>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/30">
                          {product.category}
                        </span>
                      </div>
                    </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    {/* Product Name & Brand */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {product.brandName}
                      </p>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Pill className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-semibold">Components:</span>{" "}
                          {product.components.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Package className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-semibold">Packing:</span> {product.packing}
                        </p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              ))}
            </motion.div>
          )}

          {/* No Results */}
          {!loading && !error && filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 mb-4">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 flex justify-between items-start z-10">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-blue-100 font-semibold flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Brand: {selectedProduct.brandName}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Product Image */}
                {selectedProduct.image?.url && (
                  <div className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                    <img
                      src={selectedProduct.image.url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Components */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-600 rounded-xl">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Components
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedProduct.components.map((component, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="font-medium">{component}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Uses */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-600 rounded-xl">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Uses
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedProduct.uses}
                  </p>
                </div>

                {/* Class */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-600 rounded-xl">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Drug Class
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    {selectedProduct.class}
                  </p>
                </div>

                {/* Packing */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-pink-600 rounded-xl">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Packing
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    {selectedProduct.packing}
                  </p>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">
                    Category: {selectedProduct.category}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductGallery;
