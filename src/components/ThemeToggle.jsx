import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import Switch from "./Switch";

const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useContext(ThemeContext);

  const handleThemeToggle = (e) => {
    // Prevent event bubbling
    e?.stopPropagation();
    toggleTheme();
  };

  return (
    <div className="flex items-center">
      {/* New Animated Theme Toggle Switch - Mobile Optimized */}
      <div className="scale-75 sm:scale-100">
        <Switch 
          isDark={currentTheme === "dark"} 
          onToggle={handleThemeToggle} 
        />
      </div>
    </div>
  );
};

export default ThemeToggle;
