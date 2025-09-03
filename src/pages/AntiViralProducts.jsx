import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Filter, Grid, List } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Import images
import product1 from "../assets/images/products/1.png";
import product2 from "../assets/images/products/2.png";
import product3 from "../assets/images/products/3.png";
import product4 from "../assets/images/products/4.png";

const StyledCardWrapper = styled.div`
  .card {
    width: 100%;
    max-width: 400px;
    height: auto;
    min-height: 300px;
    background-image: linear-gradient(
      163deg,
      #3b82f6 0%,
      #1d4ed8 100%
    ); /* Blue gradient */
    border-radius: 20px;
    transition: all 0.3s;
    padding: 3px;
  }
  .card2 {
    width: 100%;
    height: 100%;
    min-height: 294px;
    background-color: #1a1a1a;
    border-radius: 17px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 20px;
  }
  .card2:hover {
    transform: scale(0.98);
    border-radius: 20px;
  }
  .card:hover {
    box-shadow: 0px 0px 30px 1px rgba(59, 130, 246, 0.3); /* Blue glow */
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

const AntiViralProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");

  // Sample data for Anti-Viral products
  const products = [
    {
      id: 1,
      name: "Acyclovir",
      strength: "400mg",
      packing: "Strip of 10",
      image: product1,
      category: "Anti-Viral",
      description: "Antiviral medication for herpes infections",
    },
    {
      id: 2,
      name: "Oseltamivir",
      strength: "75mg",
      packing: "Strip of 10",
      image: product2,
      category: "Anti-Viral",
      description: "Antiviral for influenza treatment",
    },
    {
      id: 3,
      name: "Ribavirin",
      strength: "200mg",
      packing: "Strip of 10",
      image: product3,
      category: "Anti-Viral",
      description: "Broad-spectrum antiviral medication",
    },
    {
      id: 4,
      name: "Valacyclovir",
      strength: "500mg",
      packing: "Strip of 10",
      image: product4,
      category: "Anti-Viral",
      description: "Antiviral prodrug for herpes treatment",
    },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.strength.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.packing.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "strength":
          return a.strength.localeCompare(b.strength);
        case "packing":
          return a.packing.localeCompare(b.packing);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/products"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-300"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Anti-Viral Products
                </h1>
                <p className="text-gray-300 mt-1">
                  Professional antiviral medications for viral infection
                  treatment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="strength">Sort by Strength</option>
                <option value="packing">Sort by Packing</option>
              </select>

              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: product.id * 0.1 }}
                >
                  <StyledCardWrapper>
                    <div className="card">
                      <div className="card2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  </StyledCardWrapper>
                  <div className="mt-4 text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-300 mb-1">
                      Strength: {product.strength}
                    </p>
                    <p className="text-gray-300 mb-1">
                      Packing: {product.packing}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {product.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: product.id * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-300 mb-1">
                        Strength: {product.strength}
                      </p>
                      <p className="text-gray-300 mb-1">
                        Packing: {product.packing}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AntiViralProducts;
