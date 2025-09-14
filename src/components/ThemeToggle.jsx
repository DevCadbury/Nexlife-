import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { ThemeContext } from "../contexts/ThemeContext";
import Switch from "./Switch";
import TranslationMessage from "./TranslationMessage";

const ThemeToggle = () => {
  const { currentTheme, changeTheme } = useContext(ThemeContext);
  const [isDark, setIsDark] = useState(currentTheme === "dark");
  const [showMessage, setShowMessage] = useState(false);

  const handleTranslateClick = () => {
    setShowMessage(true);
  };

  const handleThemeToggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    changeTheme(newTheme);
  };

  // Update state when theme changes externally
  useEffect(() => {
    setIsDark(currentTheme === "dark");
  }, [currentTheme]);

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Google Translate Button - Hidden on mobile */}
        <motion.button
          onClick={handleTranslateClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-xs backdrop-blur-sm border border-white/20"
          title="Translation temporarily disabled"
        >
          <Languages className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">
            Translate
          </span>
        </motion.button>

        {/* Mobile Translate Button - Smaller */}
        <motion.button
          onClick={handleTranslateClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="sm:hidden flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
          title="Translation temporarily disabled"
        >
          <Languages className="w-4 h-4" />
        </motion.button>

        {/* New Animated Theme Toggle Switch - Mobile Optimized */}
        <div className="scale-75 sm:scale-100">
          <Switch isDark={isDark} onToggle={handleThemeToggle} />
        </div>
      </div>

      {/* Translation Message */}
      {showMessage && (
        <TranslationMessage onClose={() => setShowMessage(false)} />
      )}
    </>
  );
};

export default ThemeToggle;
