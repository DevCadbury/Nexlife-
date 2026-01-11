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
      {/* Compact Theme Toggle Switch */}
      <Switch 
        isDark={currentTheme === "dark"} 
        onToggle={handleThemeToggle} 
      />
    </div>
  );
};

export default ThemeToggle;
