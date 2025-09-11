import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { ThemeContext } from "../contexts/ThemeContext";
import Switch from "./Switch";

const ThemeToggle = () => {
  const { currentTheme, changeTheme } = useContext(ThemeContext);
  const [isDark, setIsDark] = useState(currentTheme === "dark");

  const handleTranslateClick = () => {
    alert(
      "Translation feature is temporarily disabled for maintenance. Please check back later."
    );
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
    <div className="flex items-center gap-4">
      {/* Google Translate Button */}
      <motion.button
        onClick={handleTranslateClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-xs backdrop-blur-sm border border-white/20"
        title="Translation temporarily disabled"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline text-xs font-medium">Translate</span>
      </motion.button>

      {/* New Animated Theme Toggle Switch */}
      <Switch isDark={isDark} onToggle={handleThemeToggle} />
    </div>
  );
};

export default ThemeToggle;
