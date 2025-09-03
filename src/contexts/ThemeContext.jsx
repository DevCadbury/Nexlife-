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
      // Set light theme as default if no saved theme
      setCurrentTheme("light");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "brand");
    root.classList.add(currentTheme);

    if (currentTheme === "dark") {
      root.classList.add("dark");
    }

    localStorage.setItem("theme", currentTheme);
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
