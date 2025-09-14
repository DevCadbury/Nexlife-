import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Languages } from "lucide-react";

const TranslationMessage = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show message after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Call the parent's onClose after animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md mx-4"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0">
              <Languages className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Translation Service
              </h3>
              <p className="text-sm text-blue-700">
                Translation feature is temporarily disabled for maintenance.
                Please check back later.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TranslationMessage;
