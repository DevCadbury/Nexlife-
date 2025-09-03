import React, { useContext } from "react";
import { Sun, Moon, Languages } from "lucide-react";
import { ThemeContext } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useContext(ThemeContext);

  // Temporarily disabled Google Translate to prevent infinite loops
  const handleTranslateClick = () => {
    // Show a simple alert instead of Google Translate
    alert(
      "Translation feature is temporarily disabled for maintenance. Please check back later."
    );
  };

  return (
    <div className="flex items-center gap-2">
      {/* Google Translate Button - Temporarily Disabled */}
      <div className="relative">
        <button
          onClick={handleTranslateClick}
          className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-all duration-200 text-xs opacity-50 cursor-not-allowed"
          title="Translation temporarily disabled"
          disabled
        >
          <Languages className="w-3 h-3" />
          <span className="hidden sm:inline text-xs">Translate</span>
        </button>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`p-1.5 rounded transition-all duration-200 text-xs ${
          currentTheme === "dark"
            ? "bg-white/10 hover:bg-white/20 text-yellow-300"
            : "bg-white/10 hover:bg-white/20 text-white"
        }`}
        title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
      >
        {currentTheme === "dark" ? (
          <Moon className="w-3 h-3" />
        ) : (
          <Sun className="w-3 h-3" />
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
