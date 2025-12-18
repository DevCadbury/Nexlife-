import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "../themes";

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Initialize from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }
    // Check system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Mark as initialized after first mount
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark", "brand");

    // Add the current theme class
    root.classList.add(currentTheme);

    // For Tailwind dark mode
    if (currentTheme === "dark" || currentTheme === "brand") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme, isInitialized]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const toggleTheme = () => {
    // Simple toggle between light and dark only
    setCurrentTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  const value = {
    currentTheme,
    changeTheme,
    toggleTheme,
    theme: themes[currentTheme],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
