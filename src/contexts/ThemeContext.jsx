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
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const defaultTheme = prefersDark ? "dark" : "light";
      setCurrentTheme(defaultTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark", "brand");

    // Add the current theme class
    root.classList.add(currentTheme);

    // For dark mode, also add the 'dark' class for Tailwind
    if (currentTheme === "dark") {
      root.classList.add("dark");
    }

    // Save to localStorage
    localStorage.setItem("theme", currentTheme);

    // Debug log
    console.log(
      "Theme changed to:",
      currentTheme,
      "Classes:",
      root.classList.toString()
    );

    // Force a re-render of the entire app to ensure dark mode is applied
    if (currentTheme === "dark") {
      // Trigger a re-render by updating the body class
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
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
