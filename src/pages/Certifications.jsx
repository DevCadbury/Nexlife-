import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  ShieldCheck,
  FileCheck,
  X,
  Download,
  ZoomIn,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
  ImageOff,
} from "lucide-react";
import SEOHead from "../components/SEOHead";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const Certifications = () => {
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedType, setSelectedType] = useState("All");
  const [certifications, setCertifications] = useState([]);
  const [certificationTypes, setCertificationTypes] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch certifications from API
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = selectedType === "All" 
          ? `${API_URL}/certifications`
          : `${API_URL}/certifications/type/${selectedType}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch certifications: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Only show visible certifications to public
        const visibleCertifications = data.filter(cert => cert.visible !== false);
        setCertifications(visibleCertifications);
        
        // Extract unique types
        const uniqueTypes = ["All", ...new Set(data.map(c => c.type).filter(Boolean))];
        setCertificationTypes(uniqueTypes);
      } catch (err) {
        console.error("Error fetching certifications:", err);
        setError(err.message);
        setCertifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, [selectedType]);

  const filteredCertifications = certifications;

  return (
    <>
      <SEOHead
        title="Certifications - Nexlife International"
        description="View our international certifications including WHO-GMP, ISO standards, and pharmaceutical licenses ensuring quality and compliance."
        keywords="WHO-GMP, ISO certification, pharmaceutical license, quality certification, manufacturing standards"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-xl shadow-blue-500/30"
            >
              <Award className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Our Certifications
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Internationally recognized certifications ensuring the highest standards of quality,
              safety, and compliance in pharmaceutical manufacturing
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-lg text-slate-600 dark:text-slate-400">Loading certifications...</p>
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
                  Failed to Load Certifications
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

          {/* Stats Section */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            >
              {[
                { icon: ShieldCheck, label: "Total Certifications", value: certifications.length },
                { icon: Award, label: "ISO Standards", value: certifications.filter(c => c.title?.includes('ISO')).length },
                { icon: FileCheck, label: "International", value: certifications.filter(c => c.type === 'Quality' || c.type === 'Manufacturing').length },
                { icon: Building2, label: "Active", value: certifications.length },
              ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mb-3">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Filter Section */}
          {!loading && !error && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {certificationTypes.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedType === type
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500"
                }`}
              >
                {type}
              </motion.button>
                ))}
            </motion.div>
          )}

          {/* Certifications Grid */}
          {!loading && !error && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCertifications.map((cert, index) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => setSelectedCert(cert)}
              >
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700">
                  {/* Certificate Image */}
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                    {cert.imageUrl ? (
                      <>
                        <img
                          src={cert.imageUrl}
                          alt={cert.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                          <Award className="w-32 h-32 text-white/30 relative z-10" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Award className="w-32 h-32 text-white/30" />
                        </div>
                      </>
                    )}
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/30">
                        {cert.type}
                      </span>
                    </div>
                    {/* Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Certificate Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {cert.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {cert.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Issued: {cert.issueDate}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Building2 className="w-4 h-4" />
                      <span className="line-clamp-1">{cert.issuedBy}</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      View Certificate
                    </motion.button>
                  </div>
                </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* No Results */}
          {!loading && !error && filteredCertifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 mb-4">
                <Award className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No certifications found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Please check back later for updates
              </p>
            </motion.div>
          )}

          {/* Trust Section */}
          {!loading && !error && certifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center shadow-2xl"
            >
            <ShieldCheck className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Certified Excellence
            </h2>
            <p className="text-blue-100 text-lg max-w-3xl mx-auto mb-6">
              Our certifications reflect our commitment to maintaining the highest standards in
              pharmaceutical manufacturing, quality control, and environmental responsibility.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-white font-semibold">WHO-GMP Certified</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-white font-semibold">ISO Certified</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-white font-semibold">Internationally Recognized</span>
              </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Certificate Detail Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCert(null)}
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
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedCert.title}</h2>
                  <p className="text-blue-100">{selectedCert.description}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCert(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Certificate Image */}
                <div className="relative h-96 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl overflow-hidden">
                  {selectedCert.imageUrl ? (
                    <>
                      <img
                        src={selectedCert.imageUrl}
                        alt={selectedCert.title}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 hidden items-center justify-center">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        <Award className="w-48 h-48 text-white/30 relative z-10" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Award className="w-48 h-48 text-white/30" />
                      </div>
                    </>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Issue Date
                      </h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">
                      {selectedCert.issueDate}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Valid Until
                      </h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">
                      {selectedCert.validUntil}
                    </p>
                  </div>

                  <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Issued By
                      </h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">
                      {selectedCert.issuedBy}
                    </p>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">Type: {selectedCert.type}</span>
                </div>

                {/* Download Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Certificate
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Certifications;
