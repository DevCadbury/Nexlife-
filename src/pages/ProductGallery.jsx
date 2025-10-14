import React, { useState } from "react";
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
} from "lucide-react";
import SEOHead from "../components/SEOHead";

// Sample product data - you can expand this with your actual products
const products = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brandName: "PARACET-500",
    image: "/src/assets/images/products/paracetamol.jpg",
    components: ["Paracetamol 500mg"],
    uses: "Fever, Pain relief, Headache, Body ache",
    class: "Analgesic & Antipyretic",
    packing: "10x10 Tablets",
    category: "Analgesic",
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    brandName: "AMOXI-500",
    image: "/src/assets/images/products/amoxicillin.jpg",
    components: ["Amoxicillin 500mg"],
    uses: "Bacterial infections, Respiratory infections, UTI",
    class: "Antibiotic (Penicillin group)",
    packing: "10x10 Capsules",
    category: "Antibiotic",
  },
  {
    id: 3,
    name: "Cetirizine 10mg",
    brandName: "CETRI-10",
    image: "/src/assets/images/products/cetirizine.jpg",
    components: ["Cetirizine Hydrochloride 10mg"],
    uses: "Allergic rhinitis, Urticaria, Allergies",
    class: "Antihistamine",
    packing: "10x10 Tablets",
    category: "Anti-Allergic",
  },
  {
    id: 4,
    name: "Metformin 500mg",
    brandName: "METFOR-500",
    image: "/src/assets/images/products/metformin.jpg",
    components: ["Metformin Hydrochloride 500mg"],
    uses: "Type 2 Diabetes, Blood sugar control",
    class: "Antidiabetic (Biguanide)",
    packing: "10x15 Tablets",
    category: "Anti-Diabetic",
  },
  {
    id: 5,
    name: "Azithromycin 500mg",
    brandName: "AZITHRO-500",
    image: "/src/assets/images/products/azithromycin.jpg",
    components: ["Azithromycin 500mg"],
    uses: "Respiratory infections, Skin infections",
    class: "Antibiotic (Macrolide)",
    packing: "3 Tablets",
    category: "Antibiotic",
  },
  {
    id: 6,
    name: "Omeprazole 20mg",
    brandName: "OMEPRA-20",
    image: "/src/assets/images/products/omeprazole.jpg",
    components: ["Omeprazole 20mg"],
    uses: "Acidity, GERD, Peptic ulcer",
    class: "Proton Pump Inhibitor",
    packing: "10x10 Capsules",
    category: "Anti-Ulcerative",
  },
];

const categories = ["All", "Analgesic", "Antibiotic", "Anti-Allergic", "Anti-Diabetic", "Anti-Ulcerative"];

const ProductGallery = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.components.some((comp) => comp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
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

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-6"
          >
            <p className="text-slate-600 dark:text-slate-400">
              Showing <span className="font-bold text-blue-600">{filteredProducts.length}</span> products
            </p>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700">
                  {/* Card Header with Gradient */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-24 h-24 text-white/30" />
                    </div>
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

          {/* No Results */}
          {filteredProducts.length === 0 && (
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
